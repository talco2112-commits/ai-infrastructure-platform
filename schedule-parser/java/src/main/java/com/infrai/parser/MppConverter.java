package com.infrai.parser;

import net.sf.mpxj.*;
import net.sf.mpxj.reader.UniversalProjectReader;

import java.io.File;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Converts any MPXJ-supported schedule file (MPP, XER, XML, MPD, etc.)
 * to a normalized JSON file containing tasks with full field set.
 *
 * Usage: java -Djava.awt.headless=true -jar schedule-parser.jar <input> <output.json>
 */
public class MppConverter {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static void main(String[] args) throws Exception {
        if (args.length < 2) {
            System.err.println("Usage: MppConverter <input-file> <output.json>");
            System.exit(1);
        }

        System.setProperty("java.awt.headless", "true");

        File input  = new File(args[0]);
        File output = new File(args[1]);

        ProjectFile project = new UniversalProjectReader().read(input);
        if (project == null) {
            System.err.println("Could not read project file: " + input);
            System.exit(2);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("{\n");

        // ── metadata ──────────────────────────────────────────────────────────
        ProjectProperties props = project.getProjectProperties();
        sb.append("  \"metadata\": {\n");
        sb.append("    \"name\": ").append(jsonStr(props.getName())).append(",\n");
        sb.append("    \"start\": ").append(jsonDate(props.getStartDate())).append(",\n");
        sb.append("    \"finish\": ").append(jsonDate(props.getFinishDate())).append(",\n");
        sb.append("    \"currencySymbol\": ").append(jsonStr(props.getCurrencySymbol())).append(",\n");
        sb.append("    \"hoursPerDay\": ").append(safeDouble(props.getMinutesPerDay(), 480.0) / 60.0).append("\n");
        sb.append("  },\n");

        // ── tasks ─────────────────────────────────────────────────────────────
        sb.append("  \"tasks\": [\n");

        List<Task> tasks = project.getTasks();
        int count = 0;
        for (Task task : tasks) {
            // Skip project-summary task (outline level 0, no name, or ID=0)
            if (task.getNull()) continue;
            if (task.getName() == null || task.getName().isBlank()) continue;
            Integer ol = task.getOutlineLevel();
            if (ol != null && ol == 0) continue;

            if (count > 0) sb.append(",\n");
            sb.append("    {\n");
            sb.append("      \"id\": ").append(count).append(",\n");
            sb.append("      \"uniqueId\": ").append(safe(task.getUniqueID(), 0)).append(",\n");
            sb.append("      \"name\": ").append(jsonStr(task.getName())).append(",\n");
            sb.append("      \"start\": ").append(jsonDate(task.getStart())).append(",\n");
            sb.append("      \"finish\": ").append(jsonDate(task.getFinish())).append(",\n");
            sb.append("      \"duration\": ").append(durationDays(task.getDuration())).append(",\n");
            sb.append("      \"percentComplete\": ").append(safeDouble(task.getPercentageComplete(), 0.0)).append(",\n");
            sb.append("      \"baselineStart\": ").append(jsonDate(task.getBaselineStart())).append(",\n");
            sb.append("      \"baselineFinish\": ").append(jsonDate(task.getBaselineFinish())).append(",\n");
            sb.append("      \"predecessors\": ").append(predecessorIds(task)).append(",\n");
            sb.append("      \"successors\": ").append(successorIds(task)).append(",\n");
            sb.append("      \"outlineLevel\": ").append(safe(task.getOutlineLevel(), 1)).append(",\n");
            sb.append("      \"wbs\": ").append(jsonStr(task.getWBS())).append(",\n");
            sb.append("      \"isMilestone\": ").append(bool(task.getMilestone())).append(",\n");
            sb.append("      \"isCritical\": ").append(bool(task.getCritical())).append(",\n");
            sb.append("      \"totalSlack\": ").append(durationDays(task.getTotalSlack())).append(",\n");
            sb.append("      \"freeSlack\": ").append(durationDays(task.getFreeSlack())).append("\n");
            sb.append("    }");
            count++;
        }

        sb.append("\n  ]\n}\n");

        try (PrintWriter pw = new PrintWriter(output, "UTF-8")) {
            pw.print(sb);
        }

        System.out.println("Parsed " + count + " tasks -> " + output.getAbsolutePath());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static String jsonStr(String s) {
        if (s == null) return "null";
        return "\"" + s.replace("\\", "\\\\")
                       .replace("\"", "\\\"")
                       .replace("\n", "\\n")
                       .replace("\r", "")
                       + "\"";
    }

    private static String jsonDate(LocalDateTime dt) {
        if (dt == null) return "null";
        return "\"" + dt.format(DATE_FMT) + "\"";
    }

    private static String bool(Boolean b) {
        return (b != null && b) ? "true" : "false";
    }

    private static int safe(Integer v, int fallback) {
        return v != null ? v : fallback;
    }

    private static double safeDouble(Number v, double fallback) {
        return v != null ? v.doubleValue() : fallback;
    }

    private static long durationDays(Duration d) {
        if (d == null) return 0;
        try {
            double val   = d.getDuration();
            TimeUnit unit = d.getUnits();
            if (unit == null) return 0;
            switch (unit) {
                case DAYS:             return Math.max(0, Math.round(val));
                case WEEKS:            return Math.max(0, Math.round(val * 5));
                case HOURS:            return Math.max(0, Math.round(val / 8));
                case MINUTES:          return Math.max(0, Math.round(val / 480));
                case ELAPSED_DAYS:     return Math.max(0, Math.round(val));
                case ELAPSED_WEEKS:    return Math.max(0, Math.round(val * 7));
                case ELAPSED_HOURS:    return Math.max(0, Math.round(val / 24));
                case ELAPSED_MINUTES:  return Math.max(0, Math.round(val / 1440));
                default:               return Math.max(0, Math.round(val));
            }
        } catch (Exception e) {
            return 0;
        }
    }

    private static String predecessorIds(Task task) {
        List<Relation> preds = task.getPredecessors();
        if (preds == null || preds.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < preds.size(); i++) {
            if (i > 0) sb.append(", ");
            Task pt = preds.get(i).getTargetTask();
            sb.append(pt != null ? safe(pt.getUniqueID(), -1) : -1);
        }
        return sb.append("]").toString();
    }

    private static String successorIds(Task task) {
        List<Relation> succs = task.getSuccessors();
        if (succs == null || succs.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < succs.size(); i++) {
            if (i > 0) sb.append(", ");
            Task st = succs.get(i).getTargetTask();
            sb.append(st != null ? safe(st.getUniqueID(), -1) : -1);
        }
        return sb.append("]").toString();
    }
}
