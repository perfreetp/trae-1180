import type { Merchant } from '@/types';

export function getLicenseDataUrl(merchantId: string): string | null {
  try {
    return localStorage.getItem(`license_img_${merchantId}`);
  } catch {
    return null;
  }
}

export function setLicenseDataUrl(merchantId: string, dataUrl: string) {
  try {
    localStorage.setItem(`license_img_${merchantId}`, dataUrl);
  } catch {
    // storage full
  }
}

export function removeLicenseDataUrl(merchantId: string) {
  try {
    localStorage.removeItem(`license_img_${merchantId}`);
  } catch {
    // ignore
  }
}

export function generateLicensePlaceholder(merchant: Merchant): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 440;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FAF3E0';
  ctx.fillRect(0, 0, 640, 440);

  ctx.strokeStyle = '#1B4332';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 616, 416);

  ctx.strokeStyle = '#2D6A4F';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(22, 22, 596, 396);

  ctx.fillStyle = '#1B4332';
  ctx.font = 'bold 28px "Noto Sans SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('农贸市场监管局', 320, 75);

  ctx.font = 'bold 22px "Noto Sans SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(merchant.licenseType || '营业证照', 320, 115);

  ctx.strokeStyle = '#2D6A4F';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 130);
  ctx.lineTo(580, 130);
  ctx.stroke();

  ctx.font = '18px "Noto Sans SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#333';

  const lines = [
    `商户名称：${merchant.name}`,
    `联  系  人：${merchant.contact}`,
    `联系电话：${merchant.phone}`,
    `经营范围：${merchant.business}`,
    `证照类型：${merchant.licenseType || '营业执照'}`,
  ];

  lines.forEach((line, i) => {
    ctx.fillText(line, 80, 175 + i * 36);
  });

  ctx.font = '14px "Noto Sans SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#999';
  ctx.textAlign = 'center';
  ctx.fillText('此为系统生成的证照存档图，请上传实际证照照片替换', 320, 400);

  return canvas.toDataURL('image/png');
}

export function ensureLicenseImage(merchant: Merchant): string | null {
  const stored = getLicenseDataUrl(merchant.id);
  if (stored) return stored;

  if (merchant.licenseUrl || merchant.licenseType) {
    const placeholder = generateLicensePlaceholder(merchant);
    if (placeholder) {
      setLicenseDataUrl(merchant.id, placeholder);
      return placeholder;
    }
  }

  return null;
}
