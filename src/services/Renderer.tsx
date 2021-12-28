import { ItemReorderEventDetail } from "@ionic/core";
import { IonCol, IonGrid, IonIcon, IonInput, IonItem, IonReorder, IonReorderGroup, IonRow } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { IListItem } from "../interfaces/IListItem";

export class Renderer {
  public static RenderViewItems = (items: IListItem[], onClick: (item: IListItem, newItem: IListItem) => void): JSX.Element[] => {
    const elements: JSX.Element[] = [];

    if (items.length <= 0) {
      return elements;
    }

    for (const item of items) {
      elements.push(
        <IonItem key={item.key}>
          <IonGrid>
            <IonRow>
              <IonCol
                onClick={() => onClick(item, { ...item, isComplete: !item.isComplete })}
                style={{ cursor: "pointer", WebkitUserSelect: "none", textDecoration: item.isComplete ? "line-through" : "none" }}>
                {item.value}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonItem>
      );
    }

    return elements;
  };

  public static RenderEditItems = (
    items: IListItem[],
    onAdd: (value: string) => void,
    onEdit: (item: IListItem, newItem: IListItem) => void,
    onDelete: (item: IListItem) => void,
    onReorder: (detail: ItemReorderEventDetail) => void
  ) => {
    const elements: JSX.Element[] = [];

    if (items) {
      for (const item of items) {
        elements.push(
          <IonItem key={item.key}>
            <IonReorder slot="start" title="kur" key="kur1" />
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonInput
                    value={item.value}
                    onBlur={(ev: any) => onEdit(item, { ...item, value: ev.target.value })}
                    style={{ cursor: "pointer", textDecoration: item.isComplete ? "line-through" : "none" }}
                  />
                </IonCol>
                <IonCol size="auto">
                  <IonIcon
                    icon={closeOutline}
                    size="large"
                    className="ion-float-right ion-color ion-color-danger"
                    onClick={() => onDelete(item)}
                    style={{ cursor: "pointer" }}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
        );
      }
    }

    elements.push(
      <IonItem key={Date.now().toString()}>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonInput
                autofocus
                onBlur={(ev: any) => onAdd(ev.target.value)}
                onKeyPress={(event: React.KeyboardEvent<HTMLIonInputElement>) => {
                  if (!event.ctrlKey && !event.altKey && !event.shiftKey && event.key === "Enter") {
                    const target: any = event.target;
                    target.blur();
                    target.value = "";
                  }
                }}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>
    );

    return (
      <IonReorderGroup onIonItemReorder={(event: CustomEvent<ItemReorderEventDetail>) => onReorder(event.detail)} disabled={false} key="reorder_component">
        {elements}
      </IonReorderGroup>
    );
  };
}
