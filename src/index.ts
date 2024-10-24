import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from "expo-modules-core";

// Import the native module. On web, it will be resolved to ReactNativeDeviceActivity.web.ts
// and on native platforms to ReactNativeDeviceActivity.ts
import DeviceActivitySelectionView from "./DeviceActivitySelectionView";
import {
  CallbackEventName,
  DeviceActivityEvent,
  DeviceActivityEventRaw,
  DeviceActivityMonitorEventPayload,
  DeviceActivitySchedule,
  DeviceActivitySelectionViewProps,
  EventParsed,
  FamilyActivitySelection,
} from "./ReactNativeDeviceActivity.types";
import ReactNativeDeviceActivityModule from "./ReactNativeDeviceActivityModule";

export async function requestAuthorization(): Promise<void> {
  return await ReactNativeDeviceActivityModule.requestAuthorization();
}

export function getEvents(
  onlyEventsForActivityWithName?: string,
): EventParsed[] {
  const events = ReactNativeDeviceActivityModule.getEvents(
    onlyEventsForActivityWithName,
  );

  const eventsParsed = Object.keys(events).map((key) => {
    const [, activityName, callbackName, eventName] = key.split("#");
    return {
      activityName,
      callbackName: callbackName as CallbackEventName,
      eventName,
      lastCalledAt: new Date(events[key]),
    };
  });

  return eventsParsed;
}

function convertDeviceActivityEvents(
  events: DeviceActivityEvent[],
): [DeviceActivityEventRaw[], FamilyActivitySelection[]] {
  const uniqueSelections: FamilyActivitySelection[] = [];

  const convertedEvents = events.map((event) => {
    const selectionIndex = uniqueSelections.indexOf(
      event.familyActivitySelection,
    );

    const wasFound = selectionIndex !== -1;

    if (!wasFound) {
      uniqueSelections.push(event.familyActivitySelection);
    }

    const familyActivitySelectionIndex = !wasFound
      ? uniqueSelections.length - 1
      : selectionIndex;

    const convertedEvent: DeviceActivityEventRaw = {
      ...event,
      familyActivitySelectionIndex,
    };

    return convertedEvent;
  });

  return [convertedEvents, uniqueSelections];
}

export async function startMonitoring(
  activityName: string,
  deviceActivitySchedule: DeviceActivitySchedule,
  deviceActivityEvents: DeviceActivityEvent[],
): Promise<void> {
  const [deviceActivityEventsRaw, uniqueSelections] =
    convertDeviceActivityEvents(deviceActivityEvents);

  return ReactNativeDeviceActivityModule.startMonitoring(
    activityName,
    deviceActivitySchedule,
    deviceActivityEventsRaw,
    uniqueSelections,
  );
}

export function stopMonitoring(activityNames?: string[]): void {
  return ReactNativeDeviceActivityModule.stopMonitoring(activityNames);
}

const emitter = new EventEmitter(
  ReactNativeDeviceActivityModule ??
    NativeModulesProxy.ReactNativeDeviceActivity,
);

export function addEventReceivedListener(
  listener: (event: DeviceActivityMonitorEventPayload) => void,
): Subscription {
  return emitter.addListener<DeviceActivityMonitorEventPayload>(
    "onDeviceActivityMonitorEvent",
    listener,
  );
}

export {
  DeviceActivitySelectionView,
  DeviceActivitySelectionViewProps as ReactNativeDeviceActivityViewProps,
};
