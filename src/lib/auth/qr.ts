import QRCode from "qrcode";

/**
 * Render an otpauth:// URI as an inline SVG string.
 *
 * Server side on purpose: the URI carries the TOTP secret, so drawing it here
 * means the browser receives a picture rather than the secret as a string in
 * client side JavaScript. It also keeps the QR library out of the client
 * bundle entirely.
 */
export async function renderQrSvg(uri: string): Promise<string> {
  return QRCode.toString(uri, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 200,
  });
}
