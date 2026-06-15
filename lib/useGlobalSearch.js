"use client";

export function openGlobalSearch() {
  window.dispatchEvent(new CustomEvent("toolstrek:open-search"));
}
