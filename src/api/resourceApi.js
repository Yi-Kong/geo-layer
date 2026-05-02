import { getJSON } from "./httpClient";

export function fetchResourceReserves() {
  return getJSON("/geo/resources/reserves");
}

export function fetchResourceStats() {
  return getJSON("/geo/resources/stats");
}

export function fetchResources() {
  return getJSON("/geo/resources");
}
