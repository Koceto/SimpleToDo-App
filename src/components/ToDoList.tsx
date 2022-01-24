import * as React from "react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";

// https://github.com/ionic-team/ionic-storage
import { Storage } from "@ionic/storage";
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { createOutline, addOutline } from "ionicons/icons";

import { IToDoListProps } from "./IToDoListProps";
import { Renderer } from "../services/Renderer";
import { Modes } from "../utility/Modes";
import { IListItem } from "../interfaces/IListItem";
import { Utility } from "../services/Utility";
import { ItemReorderEventDetail } from "@ionic/core";

export const ToDoList: React.FC<IToDoListProps> = (props: IToDoListProps): JSX.Element => {
  const alertRef = useRef<HTMLIonAlertElement>();
  const alertInputRef = useRef<{ ref?: HTMLTextAreaElement; value: "" }>({ value: "" });
  const listRef = useRef<IListItem[]>([]);
  const [storage, setStorage] = useState<{ storage: Storage | null; isLoaded: boolean }>({ storage: null, isLoaded: false });
  const [mode, setMode] = useState<Modes>(Modes.View);
  const [list, setList] = useState<IListItem[]>([]);
  const [alertIsOpen, setAlertIsOpen] = useState<boolean>(false);

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

  const onAdd = useCallback(() => {
    setAlertIsOpen(true);
  }, [setAlertIsOpen]);

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

  const setFocus = useCallback(
    (delay: number = 150) => {
      if (alertInputRef.current.ref) {
        setTimeout(() => alertInputRef.current.ref?.focus(), delay);
      }
    },
    [alertInputRef]
  );

  const clearInput = useCallback(() => {
    if (alertInputRef.current.ref) {
      alertInputRef.current.ref.value = "";
      alertInputRef.current.value = "";
    }
  }, [alertInputRef]);

  const addItem = useCallback(
    (val: string | null | undefined, dismiss: boolean = true, shouldClear: boolean = false, resetFocus: boolean = false): boolean => {
      if (val) {
        const newItem: IListItem = { value: val, key: Date.now().toString() };
        saveToStorage([newItem, ...listRef.current], true);
      }

      if (shouldClear) {
        clearInput();
      }

      if (resetFocus) {
        setFocus();
      }

      return dismiss;
    },
    [listRef, saveToStorage, clearInput, setFocus]
  );

  const itemsToDisplay = useMemo<JSX.Element | JSX.Element[] | string[]>(() => {
    if (mode === Modes.View) {
      return Renderer.RenderViewItems(list, onEdit);
    } else if (mode === Modes.Edit) {
      return Renderer.RenderEditItems(list, addItem, onEdit, onDelete, onReorder);
    } else {
      return ["Error occurred while rendering!"];
    }
  }, [mode, list, addItem, onEdit, onDelete, onReorder]);

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
    listRef.current = list;
  }, [list, listRef]);

  useEffect(() => {
    const store = new Storage();
    store.create().then((val) => setStorage({ storage: val, isLoaded: true }));

    document.addEventListener("ionBackButton", (ev: any) => {
      ev.detail.register(-1, () => {
        setMode(Modes.View);
      });
    });
  }, []);

  console.count();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ToDo</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleMode}>
              <IonIcon icon={createOutline} size="large" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>{itemsToDisplay}</IonList>
      </IonContent>
      <IonButton color="light" onClick={onAdd}>
        <IonIcon icon={addOutline} />
        <IonLabel>Add</IonLabel>
      </IonButton>
      <IonAlert
        ref={(ref: HTMLIonAlertElement) => (alertRef.current = ref)}
        isOpen={alertIsOpen}
        onDidPresent={() => setFocus()}
        onDidDismiss={() => setAlertIsOpen(false)}
        inputs={[
          {
            placeholder: "Enter text...",
            type: "text",
            cssClass: ["no-padding-vertical"],
            attributes: {
              autoCapitalize: true,
              autocapitalize: true,
              autoFocus: true,
              autofocus: true,
              ref: (ref: HTMLTextAreaElement | undefined) => (alertInputRef.current.ref = ref),
              onKeyUp: (event) => {
                const target: any = event.target;
                if (target) {
                  alertInputRef.current.value = target.value;
                }

                if (!event.ctrlKey && !event.altKey && !event.shiftKey && event.key === "Enter") {
                  addItem(target.value, false, true, true);
                }
              },
            },
          },
        ]}
        buttons={[
          "Cancel",
          {
            text: "Add",
            handler: (values: string[]) => addItem(alertInputRef.current.value, false, true, true),
          },
        ]}
      />
    </IonPage>
  );
};
