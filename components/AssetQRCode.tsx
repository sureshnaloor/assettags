import { QRCodeSVG } from 'qrcode.react';
import { PrinterIcon } from '@heroicons/react/24/outline';

interface AssetQRCodeProps {
  assetNumber: string;
  assetType?: 'mme' | 'fixedasset';
}

export const AssetQRCode = ({ assetNumber, assetType = 'mme' }: AssetQRCodeProps) => {
  const qrUrl = `${window.location.origin}/${assetType === 'fixedasset' ? 'fixedasset' : 'asset'}/${assetNumber}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Asset QR Code - ${assetNumber}</title>
          </head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h2 style="font-size: 2em;">Asset: ${assetNumber}</h2>
              <svg width="400" height="400">
                ${document.getElementById(`qr-${assetNumber}`)?.innerHTML
                    .replace(/width="32"/, 'width="400"')
                    .replace(/height="32"/, 'height="400"')}
              </svg>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div id={`qr-${assetNumber}`}>
        <QRCodeSVG
          value={qrUrl}
          size={32}
          level="H"
        />
      </div>
      <button
        onClick={handlePrint}
        className="p-1 hover:bg-gray-100 rounded-full"
        title="Print QR Code"
      >
        <PrinterIcon className="h-5 w-5" />
      </button>
    </div>
  );
};