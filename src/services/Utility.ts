import { IListItem } from "../interfaces/IListItem";

export class Utility {
  public static SortByIsComplete = (a: IListItem, b: IListItem): -1 | 0 | 1 => {
    if (a.isComplete && b.isComplete) {
      return 0;
    } else if (a.isComplete) {
      return -1;
    } else {
      return 1;
    }
  };
}
