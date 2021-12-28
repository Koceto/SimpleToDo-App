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

  private static RenderItem = (item: IListItem, onEdit: (item: IListItem, newItem: IListItem) => void, onDelete: (item: IListItem) => void): JSX.Element => {
    return (
      <IonItem key={item.key} style={{ "--highlight-color-focused": "none" }}>
        <IonReorder />
        <IonGrid className="ion-no-padding">
          <IonRow>
            <IonCol className="vertical-align ion-padding-horizontal">
              <IonInput
                value={item.value}
                onBlur={(ev: any) => onEdit(item, { ...item, value: ev.target.value })}
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

  public static RenderEditItems = (
    items: IListItem[],
    onAdd: (value: string) => void,
    onEdit: (item: IListItem, newItem: IListItem) => void,
    onDelete: (item: IListItem) => void,
    onReorder: (detail: ItemReorderEventDetail) => void
  ) => {
    const completedElements: JSX.Element[] = [];
    const activeElements: JSX.Element[] = [];

    for (const item of items) {
      if (item.isComplete) {
        completedElements.push(Renderer.RenderItem(item, onEdit, onDelete));
      } else {
        activeElements.push(Renderer.RenderItem(item, onEdit, onDelete));
      }
    }

    const emptyLine: JSX.Element = (
      <IonRow className="row-line" key={Date.now()}>
        <IonCol>
          <IonInput
            onBlur={(ev: any) => onAdd(ev.target.value)}
            onKeyPress={(event: React.KeyboardEvent<HTMLIonInputElement>) => {
              if (!event.ctrlKey && !event.altKey && !event.shiftKey && event.key === "Enter") {
                const target: any = event.target;
                target.blur();
              }
            }}
          />
        </IonCol>
      </IonRow>
    );

    const allElements: JSX.Element[] = [];
    allElements.push(
      <IonReorderGroup
        onIonItemReorder={(event: CustomEvent<ItemReorderEventDetail>) => onReorder(event.detail)}
        disabled={false}
        key="reorder_component_completed">
        {completedElements}
      </IonReorderGroup>
    );
    allElements.push(
      <IonReorderGroup
        onIonItemReorder={(event: CustomEvent<ItemReorderEventDetail>) => {
          if (event.detail.from + completedElements.length > items.length || event.detail.to + completedElements.length > items.length) {
            throw Error("Out of range!");
          }
          onReorder({ ...event.detail, from: event.detail.from + completedElements.length, to: event.detail.to + completedElements.length });
        }}
        disabled={false}
        key="reorder_component_active">
        {activeElements}
      </IonReorderGroup>
    );

    allElements.push(emptyLine);

    return allElements;
  };
}
