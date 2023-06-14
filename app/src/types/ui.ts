export interface Action<T> {
  name: string;
  onClick: (args: T) => void;
}