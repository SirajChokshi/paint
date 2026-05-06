import { describe, expect, it } from "vitest";
import { HistoryStackService, SnapshotTarget } from "./historyStack";

function createStringTarget(initialValue: string) {
  let value = initialValue;
  const target: SnapshotTarget<string> = {
    getSnapshot: () => value,
    applySnapshot: (snapshot) => {
      value = snapshot;
    },
    isEqual: (a, b) => a === b,
  };

  return {
    target,
    get value() {
      return value;
    },
    set value(nextValue: string) {
      value = nextValue;
    },
  };
}

describe("HistoryStackService", () => {
  it("captures changed transactions and restores them with undo and redo", () => {
    const canvas = createStringTarget("blank");
    const history = new HistoryStackService(canvas.target);

    history.runTransaction(() => {
      canvas.value = "drawn";
    });

    expect(history.getState()).toEqual({ canUndo: true, canRedo: false });

    expect(history.undo()).toBe(true);
    expect(canvas.value).toBe("blank");
    expect(history.getState()).toEqual({ canUndo: false, canRedo: true });

    expect(history.redo()).toBe(true);
    expect(canvas.value).toBe("drawn");
    expect(history.getState()).toEqual({ canUndo: true, canRedo: false });
  });

  it("ignores transactions that leave the snapshot unchanged", () => {
    const canvas = createStringTarget("blank");
    const history = new HistoryStackService(canvas.target);

    history.runTransaction(() => {
      canvas.value = "blank";
    });

    expect(history.getState()).toEqual({ canUndo: false, canRedo: false });
    expect(history.undo()).toBe(false);
  });

  it("clears redo history when a new transaction branches from an undone state", () => {
    const canvas = createStringTarget("blank");
    const history = new HistoryStackService(canvas.target);

    history.runTransaction(() => {
      canvas.value = "first";
    });
    history.runTransaction(() => {
      canvas.value = "second";
    });

    expect(history.undo()).toBe(true);
    expect(canvas.value).toBe("first");
    expect(history.getState()).toEqual({ canUndo: true, canRedo: true });

    history.runTransaction(() => {
      canvas.value = "branch";
    });

    expect(canvas.value).toBe("branch");
    expect(history.getState()).toEqual({ canUndo: true, canRedo: false });
    expect(history.redo()).toBe(false);
  });

  it("collapses nested transactions into a single undo step", () => {
    const canvas = createStringTarget("blank");
    const history = new HistoryStackService(canvas.target);

    history.runTransaction(() => {
      canvas.value = "preview";
      history.runTransaction(() => {
        canvas.value = "final";
      });
    });

    expect(history.undo()).toBe(true);
    expect(canvas.value).toBe("blank");
    expect(history.undo()).toBe(false);
  });

  it("supports manual transactions that span multiple mutations", () => {
    const canvas = createStringTarget("blank");
    const history = new HistoryStackService(canvas.target);

    history.beginTransaction();
    canvas.value = "stroke-started";
    canvas.value = "stroke-finished";
    history.commitTransaction();

    expect(history.undo()).toBe(true);
    expect(canvas.value).toBe("blank");
    expect(history.redo()).toBe(true);
    expect(canvas.value).toBe("stroke-finished");
  });

  it("rolls the target back when a manual transaction is canceled", () => {
    const canvas = createStringTarget("blank");
    const history = new HistoryStackService(canvas.target);

    history.beginTransaction();
    canvas.value = "orphaned-stroke";
    history.cancelTransaction();

    expect(canvas.value).toBe("blank");
    expect(history.getState()).toEqual({ canUndo: false, canRedo: false });
  });

  it("cancels the entire active transaction stack before future commits", () => {
    const canvas = createStringTarget("blank");
    const history = new HistoryStackService(canvas.target);

    history.beginTransaction();
    canvas.value = "stroke-started";
    history.beginTransaction();
    canvas.value = "right-click-stroke";
    history.cancelTransaction();

    expect(canvas.value).toBe("blank");
    expect(history.getState()).toEqual({ canUndo: false, canRedo: false });

    history.runTransaction(() => {
      canvas.value = "next-stroke";
    });

    expect(history.undo()).toBe(true);
    expect(canvas.value).toBe("blank");
  });

  it("commits async transactions after awaited work changes the target", async () => {
    const canvas = createStringTarget("blank");
    const history = new HistoryStackService(canvas.target);

    await history.runAsyncTransaction(async () => {
      await Promise.resolve();
      canvas.value = "imported";
    });

    expect(history.undo()).toBe(true);
    expect(canvas.value).toBe("blank");
    expect(history.redo()).toBe(true);
    expect(canvas.value).toBe("imported");
  });

  it("keeps only the configured number of undo snapshots", () => {
    const canvas = createStringTarget("0");
    const history = new HistoryStackService(canvas.target, { maxUndoDepth: 2 });

    history.runTransaction(() => {
      canvas.value = "1";
    });
    history.runTransaction(() => {
      canvas.value = "2";
    });
    history.runTransaction(() => {
      canvas.value = "3";
    });

    expect(history.undo()).toBe(true);
    expect(canvas.value).toBe("2");
    expect(history.undo()).toBe(true);
    expect(canvas.value).toBe("1");
    expect(history.undo()).toBe(false);
  });
});
