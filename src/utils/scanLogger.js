// scanLogger.js
//
// Lightweight persistent event logger for diagnosing intermittent
// scan/API-call failures on the Scan screen.
//
// - Logs are stored as a JSON file via expo-file-system (no extra
//   native package install required in most Expo projects).
// - Every read/write prunes entries older than 48 hours, so the log
//   file can't grow forever and always self-expires.
// - Writes are queued (not per-keystroke) so logging never competes
//   with the barcode-scanner's rapid-fire input.

import * as FileSystem from 'expo-file-system';

const LOG_FILE = `${FileSystem.documentDirectory}scan_debug_logs_v1.json`;
const MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours
const MAX_ENTRIES = 2000; // hard safety cap regardless of age

// Simple in-memory queue so rapid calls to addLog() don't cause
// overlapping read-modify-write races against the log file.
let writeQueue = Promise.resolve();

function pruneOldLogs(logs) {
  const cutoff = Date.now() - MAX_AGE_MS;
  const pruned = logs.filter((entry) => entry.ts >= cutoff);
  // If still too large (shouldn't normally happen), keep only the newest.
  if (pruned.length > MAX_ENTRIES) {
    return pruned.slice(pruned.length - MAX_ENTRIES);
  }
  return pruned;
}

async function readLogs() {
  try {
    const info = await FileSystem.getInfoAsync(LOG_FILE);
    if (!info.exists) return [];
    const raw = await FileSystem.readAsStringAsync(LOG_FILE);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.log('scanLogger.readLogs error:', err?.message);
    return [];
  }
}

async function writeLogs(logs) {
  try {
    await FileSystem.writeAsStringAsync(LOG_FILE, JSON.stringify(logs));
  } catch (err) {
    console.log('scanLogger.writeLogs error:', err?.message);
  }
}

/**
 * Record a log entry. Fire-and-forget is fine (don't await if you
 * don't need to), but calls are internally queued/serialized.
 */
export function addLog(event, data = {}) {
  writeQueue = writeQueue.then(async () => {
    const existing = await readLogs();
    existing.push({ ts: Date.now(), event, data });
    const pruned = pruneOldLogs(existing);
    await writeLogs(pruned);
  });
  return writeQueue;
}

/**
 * Retrieve current logs (newest first), pruning expired entries
 * as a side effect.
 */
export async function getLogs() {
  const existing = await readLogs();
  const pruned = pruneOldLogs(existing);
  if (pruned.length !== existing.length) {
    await writeLogs(pruned);
  }
  return [...pruned].sort((a, b) => b.ts - a.ts);
}

export async function clearLogs() {
  await writeLogs([]);
}

export function formatLogsAsText(logs) {
  if (!logs.length) return 'No logs recorded in the last 48 hours.';
  return logs
    .map((l) => {
      const time = new Date(l.ts).toLocaleString();
      const dataStr = l.data && Object.keys(l.data).length
        ? ' ' + JSON.stringify(l.data)
        : '';
      return `[${time}] ${l.event}${dataStr}`;
    })
    .join('\n');
}
