import * as React from "react";
import { useState, useMemo, useEffect, useCallback } from "react";

// https://github.com/ionic-team/ionic-storage
import { Storage } from "@ionic/storage";
import { IonButton, IonContent, IonHeader, IonIcon, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { pencil } from "ionicons/icons";

import { IToDoListProps } from "./IToDoListProps";
import { Renderer } from "../services/Renderer";
import { Modes } from "../utility/Modes";
import { IListItem } from "../interfaces/IListItem";
import { Utility } from "../services/Utility";
import { ItemReorderEventDetail } from "@ionic/core";

export const ToDoList: React.FC<IToDoListProps> = (props: IToDoListProps): JSX.Element => {
  const [storage, setStorage] = useState<{ storage: Storage | null; isLoaded: boolean }>({ storage: null, isLoaded: false });
  const [mode, setMode] = useState<Modes>(Modes.View);
  const [list, setList] = useState<IListItem[]>([]);

  const saveToStorage = useCallback(
    (items: IListItem[], forceRefresh: boolean = false) => {
      if (!storage.isLoaded) {
        throw Error("Storage is not loaded!");
      }

      storage.storage?.set("list-items", [...items]);
      // force refresh
      if (forceRefresh) {
        setStorage({ isLoaded: true, storage: storage.storage });
      }
    },
    [storage]
  );

  const onCreate = useCallback(
    (val: string | null | undefined) => {
      if (val) {
        const newItem: IListItem = { value: val, key: Date.now().toString() };
        saveToStorage([...list, newItem], true);
      }
    },
    [list, saveToStorage]
  );

  const onEdit = useCallback(
    (item: IListItem, newItem?: IListItem) => {
      if (item && newItem) {
        const index = list.indexOf(item);

        if (index >= 0) {
          list[index] = { ...newItem };
          saveToStorage(list, true);
        } else {
          throw Error("Could not find value to edit!");
        }
      } else {
        throw Error("Missing item or new value!");
      }
    },
    [list, saveToStorage]
  );

  const onDelete = useCallback(
    (val: IListItem) => {
      if (val) {
        saveToStorage([...list.filter((li) => li !== val)], true);
      }
    },
    [list, saveToStorage]
  );

  const onReorder = useCallback(
    (detail: ItemReorderEventDetail) => {
      const items: IListItem[] = list.splice(detail.from, 1);

      if (items.length === 1) {
        list.splice(detail.to, 0, items[0]);
      } else {
        throw Error("None or many items in reorder!");
      }
      saveToStorage(list, true);
      detail.complete(true);
    },
    [list, saveToStorage]
  );

  const toggleMode = useCallback(() => {
    setMode(mode === Modes.Edit ? Modes.View : Modes.Edit);
  }, [mode, setMode]);

  const itemsToDisplay = useMemo<JSX.Element | JSX.Element[] | string[]>(() => {
    if (mode === Modes.View) {
      return Renderer.RenderViewItems(list, onEdit);
    } else if (mode === Modes.Edit) {
      return Renderer.RenderEditItems(list, onCreate, onEdit, onDelete, onReorder);
    } else {
      return ["Error occurred while rendering!"];
    }
  }, [mode, list, onCreate, onEdit, onDelete, onReorder]);

  useEffect(() => {
    if (storage.isLoaded) {
      storage.storage?.get("list-items").then((items: IListItem[]) => {
        if (items) {
          setList(items.sort(Utility.SortByIsComplete));
        }
      });
    }
  }, [storage]);

  useEffect(() => {
    const store = new Storage();
    store.create().then((val) => setStorage({ storage: val, isLoaded: true }));

    document.addEventListener("ionBackButton", (ev: any) => {
      ev.detail.register(-1, () => {
        setMode(Modes.View);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ToDo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>{itemsToDisplay}</IonList>
      </IonContent>
      <IonButton color="light" onClick={toggleMode}>
        <IonIcon icon={pencil} />
        <IonLabel>{mode === Modes.Edit ? Modes.View : Modes.Edit}</IonLabel>
      </IonButton>
    </IonPage>
  );
};
