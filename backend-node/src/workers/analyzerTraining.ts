import { trainPythonAnalyzerFromDatabase } from "../modules/threats/pythonAnalyzer.service";

const TRAINING_INTERVAL_MS = 10 * 60 * 1000;

async function trainAnalyzer() {
  const result = await trainPythonAnalyzerFromDatabase();
  if (!result) {
    console.warn("Python analyzer training skipped: service unavailable.");
    return;
  }

  console.log(
    `Python analyzer training: ${result.trained ? "trained" : "skipped"} ` +
      `(${result.samples} samples) - ${result.message}`
  );
}

export function startAnalyzerTrainingLoop() {
  setTimeout(trainAnalyzer, 15_000);
  setInterval(trainAnalyzer, TRAINING_INTERVAL_MS);
}
