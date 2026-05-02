import { request } from "./httpClient";

export function fetchResourceReserves() {
  return request.get("/geo/resources/reserves");
}

export function fetchResourceStats() {
  return request.get("/geo/resources/stats");
}

export function fetchResources() {
  return request.get("/geo/resources");
}
