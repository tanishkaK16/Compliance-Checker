import json
import time
import shutil
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.utils.config import SHARED_DATA_PATH

app = FastAPI(
    title="Compliance Checker API",
    description="Single-agent compliance pipeline for RBI/SEBI/MCA circulars",
    version="2.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helpers ────────────────────────────────────────────────────────────────

def shared_path(filename: str) -> Path:
    return Path(SHARED_DATA_PATH) / filename


def read_json(filename: str):
    """Read a JSON file from shared_data/. Returns None if missing or empty."""
    path = shared_path(filename)
    if not path.exists() or path.stat().st_size == 0:
        return None
    with open(path, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return None


def write_json(filename: str, data: dict):
    """Write a dict as JSON to shared_data/."""
    path = shared_path(filename)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def get_next_run_id() -> str:
    """Derive the next run ID from evolution_history.json."""
    history = read_json("evolution_history.json")
    if not history or not history.get("runs"):
        return "run_1"
    last_run = history["runs"][-1]["run_id"]  # e.g. "run_1"
    try:
        num = int(last_run.split("_")[1]) + 1
    except (IndexError, ValueError):
        num = len(history["runs"]) + 1
    return f"run_{num}"


# ── Endpoints ──────────────────────────────────────────────────────────────

@app.post("/run_compliance_crew")
async def run_compliance_crew():
    """
    Triggers the ComplianceOrchestratorAgent pipeline.
    - Calls crew.py
    - Writes results to all three shared_data/ JSON files
    - Returns run summary on success
    - Returns HTTP 500 with readable message on failure
    """
    run_id = get_next_run_id()
    start_time = time.time()

    # Mark as running immediately so frontend poller sees it
    write_json("simulation_results.json", {
        "run_id": run_id,
        "status": "running",
        "steps_completed": [],
        "duration_seconds": 0,
    })

    try:
        from backend.crew import ComplianceOrchestratorAgent
        agent = ComplianceOrchestratorAgent()
        result = agent.run()

    except NotImplementedError:
        # crew.py is still a stub — write a clean failure state
        write_json("simulation_results.json", {
            "run_id": run_id,
            "status": "failed",
            "error": "crew.py not implemented yet — AI Dev needs to complete Phase 2",
            "steps_completed": [],
            "duration_seconds": 0,
        })
        raise HTTPException(
            status_code=500,
            detail="Pipeline not implemented yet. AI Dev must complete crew.py Phase 2."
        )

    except Exception as e:
        # Any other pipeline error
        duration = round(time.time() - start_time, 2)
        write_json("simulation_results.json", {
            "run_id": run_id,
            "status": "failed",
            "error": str(e),
            "steps_completed": [],
            "duration_seconds": duration,
        })
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline error: {str(e)}"
        )

    # ── Pipeline succeeded — write all three JSON files ────────────────────

    duration = round(time.time() - start_time, 2)
    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S")

    # 1. simulation_results.json
    write_json("simulation_results.json", {
        "run_id": run_id,
        "status": "complete",
        "steps_completed": ["scrape", "diff", "rag_map", "amend", "report", "evolve"],
        "duration_seconds": duration,
    })

    # 2. latest_report.json
    # result from crew.py must match the locked schema
    report = result if isinstance(result, dict) else {}
    report["run_id"] = run_id
    report["timestamp"] = timestamp
    write_json("latest_report.json", report)

    # 3. evolution_history.json — append new run score
    history = read_json("evolution_history.json") or {"runs": []}
    history["runs"].append({
        "run_id": run_id,
        "score": report.get("evolution_score", 0),
        "timestamp": timestamp,
    })
    write_json("evolution_history.json", history)

    return {
        "status": "complete",
        "run_id": run_id,
        "duration_seconds": duration,
        "evolution_score": report.get("evolution_score", 0),
        "risk_level": report.get("risk_level", "unknown"),
        "changes_detected": len(report.get("changes", [])),
    }


@app.get("/status")
async def get_status():
    """
    Returns the current run status from simulation_results.json.
    Frontend polls this every 3 seconds during the live-agents screen.
    Returns clean empty state if file doesn't exist yet.
    """
    data = read_json("simulation_results.json")
    if data is None:
        return {"status": "not_started"}
    return data


@app.get("/report")
async def get_report():
    """
    Returns the latest compliance report from latest_report.json.
    Returns clean empty state if no report exists yet.
    """
    data = read_json("latest_report.json")
    if data is None:
        return {
            "message": "No report available yet. Run a compliance check first.",
            "empty": True,
        }
    return data


@app.get("/evolution")
async def get_evolution():
    """
    Returns the evolution history from evolution_history.json.
    Returns empty runs list if no history exists yet.
    """
    data = read_json("evolution_history.json")
    if data is None:
        return {"runs": []}
    return data


@app.post("/reset")
async def reset():
    """
    Resets demo state between judge presentations.
    - Clears all three shared_data/ JSON files
    - Restores internal_policy.pdf from backup (if backup exists)
    """
    # Clear shared_data/ JSON files
    write_json("latest_report.json", {})
    write_json("evolution_history.json", {"runs": []})
    write_json("simulation_results.json", {"status": "not_started"})

    # Restore internal_policy.pdf from backup if it exists
    policy_path = Path("backend/data/company_docs/internal_policy.pdf")
    backup_path = Path("backend/data/company_docs/internal_policy_backup.pdf")
    pdf_restored = False

    if backup_path.exists():
        shutil.copy2(backup_path, policy_path)
        pdf_restored = True

    return {
        "status": "reset",
        "message": "shared_data/ cleared. Ready for a fresh demo run.",
        "pdf_restored": pdf_restored,
    }


@app.get("/health")
async def health():
    """Health check — confirms API is running."""
    return {"status": "ok", "service": "compliance-checker-api", "version": "2.0.0"}