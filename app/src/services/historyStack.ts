export interface SnapshotTarget<TSnapshot> {
  getSnapshot: () => TSnapshot;
  applySnapshot: (snapshot: TSnapshot) => void;
  isEqual?: (a: TSnapshot, b: TSnapshot) => boolean;
}

export interface HistoryStackState {
  canUndo: boolean;
  canRedo: boolean;
}

export interface HistorySideEffect {
  undo: () => void;
  redo: () => void;
}

interface HistoryUndoEntry<TSnapshot> {
  snapshot: TSnapshot;
  sideEffect?: HistorySideEffect;
}

interface HistoryStackOptions {
  maxUndoDepth?: number;
}

type Listener = (state: HistoryStackState) => void;

const DEFAULT_MAX_UNDO_DEPTH = 50;

function defaultIsEqual<TSnapshot>(a: TSnapshot, b: TSnapshot) {
  return Object.is(a, b);
}

export class HistoryStackService<TSnapshot> {
  private readonly target: SnapshotTarget<TSnapshot>;
  private readonly maxUndoDepth: number;
  private readonly undoStack: HistoryUndoEntry<TSnapshot>[] = [];
  private readonly redoStack: HistoryUndoEntry<TSnapshot>[] = [];
  private readonly listeners = new Set<Listener>();
  private transactionDepth = 0;
  private transactionBefore: TSnapshot | null = null;
  private isApplyingHistory = false;
  private pendingSideEffect: HistorySideEffect | null = null;

  constructor(
    target: SnapshotTarget<TSnapshot>,
    options: HistoryStackOptions = {},
  ) {
    this.target = target;
    this.maxUndoDepth = options.maxUndoDepth ?? DEFAULT_MAX_UNDO_DEPTH;
  }

  getState(): HistoryStackState {
    return {
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
    };
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  reset() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.transactionDepth = 0;
    this.transactionBefore = null;
    this.emit();
  }

  runTransaction<T>(operation: () => T): T {
    this.beginTransaction();

    try {
      const result = operation();
      this.commitTransaction();
      return result;
    } catch (error) {
      this.cancelTransaction();
      throw error;
    }
  }

  async runAsyncTransaction<T>(operation: () => Promise<T>): Promise<T> {
    this.beginTransaction();

    try {
      const result = await operation();
      this.commitTransaction();
      return result;
    } catch (error) {
      this.cancelTransaction();
      throw error;
    }
  }

  requestSideEffectForNextCommit(sideEffect: HistorySideEffect) {
    this.pendingSideEffect = sideEffect;
  }

  undo() {
    const entry = this.undoStack.pop();
    if (entry === undefined) {
      return false;
    }

    this.redoStack.push({
      snapshot: this.target.getSnapshot(),
      sideEffect: entry.sideEffect,
    });
    this.applyHistorySnapshot(entry.snapshot);
    entry.sideEffect?.undo();
    this.emit();

    return true;
  }

  redo() {
    const entry = this.redoStack.pop();
    if (entry === undefined) {
      return false;
    }

    this.undoStack.push({
      snapshot: this.target.getSnapshot(),
      sideEffect: entry.sideEffect,
    });
    this.applyHistorySnapshot(entry.snapshot);
    entry.sideEffect?.redo();
    this.emit();

    return true;
  }

  beginTransaction() {
    if (this.isApplyingHistory) {
      return;
    }

    if (this.transactionDepth === 0) {
      this.transactionBefore = this.target.getSnapshot();
    }

    this.transactionDepth += 1;
  }

  commitTransaction() {
    if (this.isApplyingHistory || this.transactionDepth === 0) {
      return;
    }

    this.transactionDepth -= 1;
    if (this.transactionDepth > 0) {
      return;
    }

    const before = this.transactionBefore;
    this.transactionBefore = null;
    if (before === null) {
      return;
    }

    const after = this.target.getSnapshot();
    if (this.snapshotsEqual(before, after)) {
      return;
    }

    this.undoStack.push({
      snapshot: before,
      sideEffect: this.pendingSideEffect ?? undefined,
    });
    this.pendingSideEffect = null;
    if (this.undoStack.length > this.maxUndoDepth) {
      this.undoStack.shift();
    }
    this.redoStack.length = 0;
    this.emit();
  }

  cancelTransaction() {
    if (this.transactionDepth === 0) {
      return;
    }

    this.transactionDepth = 0;
    const before = this.transactionBefore;
    this.transactionBefore = null;
    this.pendingSideEffect = null;
    if (before !== null) {
      this.applyHistorySnapshot(before);
    }
  }

  private applyHistorySnapshot(snapshot: TSnapshot) {
    this.isApplyingHistory = true;
    try {
      this.target.applySnapshot(snapshot);
    } finally {
      this.isApplyingHistory = false;
    }
  }

  private snapshotsEqual(a: TSnapshot, b: TSnapshot) {
    return (this.target.isEqual ?? defaultIsEqual)(a, b);
  }

  private emit() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}
