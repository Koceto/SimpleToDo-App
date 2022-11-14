import { ItemReorderEventDetail } from "@ionic/core";
import { IonCol, IonGrid, IonIcon, IonInput, IonItem, IonReorder, IonReorderGroup, IonRow } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { IListItem } from "../interfaces/IListItem";

export class Renderer {
  private static RenderItem = (item: IListItem, onEdit: (item: IListItem, newItem: IListItem) => void, onDelete: (item: IListItem) => void): JSX.Element => {
    return (
      <IonItem key={item.key} style={{ "--highlight-color-focused": "none" }}>
        <IonReorder />

        <IonGrid className="ion-no-padding">
          <IonRow>
            <IonCol className="vertical-align ion-padding-horizontal">
              <IonInput
                value={item.value}
                onIonChange={(ev: any) => onEdit(item, { ...item, value: ev.target.value })}
                style={{ cursor: "pointer", textDecoration: item.isComplete ? "line-through" : "none" }}
              />
            </IonCol>

            <IonItem lines="none">
              <IonCol size="auto" className="vertical-align">
                <IonIcon icon={closeOutline} size="large" className="ion-color ion-color-danger" onClick={() => onDelete(item)} style={{ cursor: "pointer" }} />
              </IonCol>
            </IonItem>
          </IonRow>
        </IonGrid>
      </IonItem>
    );
  };

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

    for (const item of items) {
      elements.push(Renderer.RenderItem(item, onEdit, onDelete));
    }

    const emptyLine: JSX.Element = (
      <IonRow className="row-line" key={Date.now()}>
        <IonCol>
          <IonInput
            onBlur={(ev: any) => onAdd(ev.target.value)}
            onKeyPress={(event: React.KeyboardEvent<HTMLIonInputElement>) => {
              if (!event.ctrlKey && !event.altKey && !event.shiftKey && event.key === "Enter") {
                const target: any = event.target;
                if (target) {
                  target.blur();
                }
              }
            }}
            placeholder="Enter text..."
            autocapitalize="sentence"
            autoCapitalize="sentence"
          />
        </IonCol>
      </IonRow>
    );

    const allElements: JSX.Element[] = [];
    allElements.push(
      <IonReorderGroup onIonItemReorder={(event: CustomEvent<ItemReorderEventDetail>) => onReorder(event.detail)} disabled={false} key="reorder_component">
        {elements}
      </IonReorderGroup>
    );

    allElements.push(emptyLine);

    return allElements;
  };
}
