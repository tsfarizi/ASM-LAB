const CHEERPX_VERSION = "1.1.7";

let cheerpxPromise:
  | Promise<{
      Linux: typeof import("@leaningtech/cheerpx").Linux;
      HttpBytesDevice: typeof import("@leaningtech/cheerpx").HttpBytesDevice;
      IDBDevice: typeof import("@leaningtech/cheerpx").IDBDevice;
      OverlayDevice: typeof import("@leaningtech/cheerpx").OverlayDevice;
      DataDevice: typeof import("@leaningtech/cheerpx").DataDevice;
    }>
  | null = null;

export const loadCheerpX = async () => {
  if (!cheerpxPromise) {
    cheerpxPromise = (async () => {
      const module = await import(
        /* @vite-ignore */ `https://cxrtnc.leaningtech.com/${CHEERPX_VERSION}/cx.esm.js`
      );

      return {
        Linux: module.Linux,
        HttpBytesDevice: module.HttpBytesDevice,
        IDBDevice: module.IDBDevice,
        OverlayDevice: module.OverlayDevice,
        DataDevice: module.DataDevice,
      };
    })();
  }

  return cheerpxPromise;
};
