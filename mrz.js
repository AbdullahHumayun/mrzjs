
  document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('uploadButton');

    if (!uploadButton) {
      console.error('Upload button not found. Please ensure the ID is correct.');
      return;
    }

    console.log('Upload button found:', uploadButton);

    // Create and append hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    console.log('File input created and appended to the body');

    uploadButton.addEventListener('click', function() {
      console.log('Upload button clicked');
      fileInput.click();
    });

    fileInput.addEventListener('change', function(event) {
      console.log('File input changed');
      const file = event.target.files[0];
      if (file) {
        console.log('File selected:', file);
        const reader = new FileReader();
        reader.onload = function() {
          console.log('File read as data URL');
          processImage(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        console.error('No file selected');
      }
    });

    function processImage(imageDataUrl) {
      console.log('Processing image...');
      Tesseract.recognize(
        imageDataUrl,
        'eng',
        {
          logger: m => console.log(m)
        }
      ).then(({ data: { text } }) => {
        console.log('OCR Result:', text);
        parseMRZ(text);
      }).catch(error => console.error('Error processing image:', error));
    }

    function parseMRZ(ocrText) {
      try {
        const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        console.log('Parsed Lines:', lines);
        if (lines.length < 2) {
          throw new Error('Insufficient MRZ lines found');
        }

        const mrzLine1 = lines[lines.length - 2];
        const mrzLine2 = lines[lines.length - 1];
        console.log('MRZ Line 1:', mrzLine1);
        console.log('MRZ Line 2:', mrzLine2);

        const nationalityAlpha3 = mrzLine2.slice(10, 13).replace(/</g, '');
        const nationalityAlpha2 = alpha3ToAlpha2(nationalityAlpha3);

        const dob = formatMRZDate(mrzLine2.slice(13, 19));
        const nameParts = mrzLine1.slice(5).split('<<');
        const surname = nameParts[0].replace(/</g, ' ');
        const givenNames = nameParts[1].replace(/</g, ' ');

        document.getElementById('nameField').value = `${surname} ${givenNames}`;
        document.getElementById('dobField').value = dob;
        document.getElementById('nationalityField').value = nationalityAlpha2;
      } catch (error) {
        console.error('Error parsing MRZ:', error);
      }
    }

    function alpha3ToAlpha2(alpha3) {
      const alpha3ToAlpha2Map = {
        'AUS': 'AU', 'AUT': 'AT', 'BEL': 'BE', 'CAN': 'CA', 'CHL': 'CL', 'CZE': 'CZ', 'DNK': 'DK', 
        'EST': 'EE', 'FIN': 'FI', 'FRA': 'FR', 'DEU': 'DE', 'GRC': 'GR', 'HUN': 'HU', 'ISL': 'IS', 
        'IRL': 'IE', 'ISR': 'IL', 'ITA': 'IT', 'JPN': 'JP', 'KOR': 'KR', 'LVA': 'LV', 'LTU': 'LT', 
        'LUX': 'LU', 'MEX': 'MX', 'NLD': 'NL', 'NZL': 'NZ', 'NOR': 'NO', 'POL': 'PL', 'PRT': 'PT', 
        'SVK': 'SK', 'SVN': 'SI', 'ESP': 'ES', 'SWE': 'SE', 'CHE': 'CH', 'TUR': 'TR', 'GBR': 'GB', 
        'USA': 'US'
      };
      return alpha3ToAlpha2Map[alpha3] || alpha3;
    }

    function formatMRZDate(mrzDate) {
      const year = mrzDate.slice(0, 2);
      const month = mrzDate.slice(2, 4);
      const day = mrzDate.slice(4, 6);
      return `${day}/${month}/${year}`;
    }
  });
