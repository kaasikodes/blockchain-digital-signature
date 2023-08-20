export const serializeSignature = (signature) => {
  return JSON.stringify({
    r: signature.r.toString(),
    s: signature.s.toString(),
    recovery: signature.recovery.toString(),
  });
};
