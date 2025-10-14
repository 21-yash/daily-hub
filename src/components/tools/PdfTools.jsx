import React, { useState } from 'react';
import { FileDown, X, Minimize2, Merge, FileText, Loader2, Image, FileImage, Layers } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'; 

// Set up the worker for pdf.js.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Reusable file input component (updated for multiple files)
const FileInput = ({ onFileChange, onClear, id, theme, file, files, isMultiple = false, accept }) => {
  const displayFiles = isMultiple ? files : (file ? [file] : []);
  
  return (
    <div className="relative w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center min-h-[80px] flex items-center justify-center">
      <input
        type="file"
        id={id}
        accept={accept}
        onChange={onFileChange}
        multiple={isMultiple}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <label htmlFor={id} className="cursor-pointer">
        {displayFiles.length > 0 ? (
          <div className="flex flex-col items-center gap-2 text-green-500">
            {isMultiple ? <Layers size={20} /> : <FileText size={20} />}
            <span className="font-medium">
              {displayFiles.length} file{displayFiles.length > 1 ? 's' : ''} selected
            </span>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Click or drag to upload {isMultiple ? 'image(s)' : 'PDF'}
          </p>
        )}
      </label>
      {displayFiles.length > 0 && (
        <button
          onClick={onClear}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-transform hover:scale-110"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};


const PdfTools = ({ theme, showToast }) => {
  const [activeTool, setActiveTool] = useState('compress');
  
  // State for each tool's files
  const [compressFile, setCompressFile] = useState(null);
  const [mergeFiles, setMergeFiles] = useState([null, null]);
  const [pdfToImageFile, setPdfToImageFile] = useState(null);
  const [imageToPdfFiles, setImageToPdfFiles] = useState([]);

  // State for processed results
  const [processedFile, setProcessedFile] = useState(null); // For single PDF outputs
  const [processedImages, setProcessedImages] = useState([]); // For PDF to Image output
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = () => {
    setProcessedFile(null);
    setProcessedImages([]);
  };

  // --- File Handlers ---
  const handleFileChange = (e, tool, index = null) => {
    const files = Array.from(e.target.files);
    resetState();

    if (tool === 'compress' || tool === 'pdf-to-image') {
      const file = files[0];
      if (file && file.type !== 'application/pdf') return showToast('Please select a valid PDF.', 'error');
      if (tool === 'compress') setCompressFile(file);
      else setPdfToImageFile(file);
    } else if (tool === 'merge') {
      const file = files[0];
      if (file && file.type !== 'application/pdf') return showToast('Please select a valid PDF.', 'error');
      const newFiles = [...mergeFiles];
      newFiles[index] = file;
      setMergeFiles(newFiles);
    } else if (tool === 'image-to-pdf') {
        const imageFiles = files.filter(f => ['image/png', 'image/jpeg'].includes(f.type));
        if(imageFiles.length !== files.length) showToast('Some files were not valid images (PNG/JPG).', 'warning');
        setImageToPdfFiles(imageFiles);
    }
  };

  const clearFile = (tool, index = null) => {
    if (tool === 'compress') setCompressFile(null);
    if (tool === 'pdf-to-image') setPdfToImageFile(null);
    if (tool === 'image-to-pdf') setImageToPdfFiles([]);
    if (tool === 'merge') {
      const newFiles = [...mergeFiles];
      newFiles[index] = null;
      setMergeFiles(newFiles);
    }
    resetState();
  };
  
  const handleToolChange = (tool) => {
    setActiveTool(tool);
    resetState();
  }

  // --- PDF Processing Logic ---
  const runCompression = async () => {
    if (!compressFile) return showToast('Please select a file to compress.', 'error');
    setIsProcessing(true);
    showToast('Compressing PDF...', 'info');

    try {
      const existingPdfBytes = await compressFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes, { updateMetadata: false });
      const pdfBytes = await pdfDoc.save();
      
      setProcessedFile({
        bytes: pdfBytes,
        name: `compressed_${compressFile.name}`,
        originalSize: compressFile.size,
      });
      showToast('Compression successful! Ready to download.', 'success');
    } catch (err) {
      showToast('Failed to compress PDF.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const runMerge = async () => {
    if (!mergeFiles[0] || !mergeFiles[1]) return showToast('Please select two files to merge.', 'error');
    setIsProcessing(true);
    showToast('Merging PDFs...', 'info');
    
    try {
      const firstDoc = await PDFDocument.load(await mergeFiles[0].arrayBuffer());
      const secondDoc = await PDFDocument.load(await mergeFiles[1].arrayBuffer());
      const mergedDoc = await PDFDocument.create();

      const firstPages = await mergedDoc.copyPages(firstDoc, firstDoc.getPageIndices());
      firstPages.forEach(page => mergedDoc.addPage(page));
      
      const secondPages = await mergedDoc.copyPages(secondDoc, secondDoc.getPageIndices());
      secondPages.forEach(page => mergedDoc.addPage(page));

      const pdfBytes = await mergedDoc.save();
      setProcessedFile({ bytes: pdfBytes, name: 'merged_document.pdf' });
      showToast('PDFs merged successfully! Ready to download.', 'success');
    } catch(err) {
      showToast('Failed to merge PDFs.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const runPdfToImage = async () => {
    if (!pdfToImageFile) return showToast('Please select a PDF file.', 'error');
    setIsProcessing(true);
    showToast('Converting PDF to images...', 'info');

    try {
        const arrayBuffer = await pdfToImageFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const images = [];
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            images.push(canvas.toDataURL('image/png'));
        }
        setProcessedImages(images);
        showToast(`Converted ${numPages} pages to images.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to convert PDF to images.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const runImageToPdf = async () => {
    if (imageToPdfFiles.length === 0) return showToast('Please select one or more images.', 'error');
    setIsProcessing(true);
    showToast('Converting images to PDF...', 'info');

    try {
        const pdfDoc = await PDFDocument.create();
        for (const imageFile of imageToPdfFiles) {
            const imageBytes = await imageFile.arrayBuffer();
            let image;
            if (imageFile.type === 'image/png') {
                image = await pdfDoc.embedPng(imageBytes);
            } else {
                image = await pdfDoc.embedJpg(imageBytes);
            }
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
        const pdfBytes = await pdfDoc.save();
        setProcessedFile({ bytes: pdfBytes, name: 'converted_from_images.pdf' });
        showToast('Images converted to PDF successfully!', 'success');
    } catch (err) {
        showToast('Failed to convert images to PDF.', 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  // --- Download Handlers ---
  const handleDownload = () => {
    if (!processedFile) return;
    const blob = new Blob([processedFile.bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = processedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadImage = (imageDataUrl, index) => {
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `page_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // --- UI Vars ---
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const toolButtonClasses = "px-4 py-2 rounded-lg font-semibold transition-all duration-200";
  const activeToolClasses = "bg-blue-500 text-white shadow-md";
  const inactiveToolClasses = theme === 'dark' ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300";

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">PDF Tools 🚀</h2>
      
      {/* Tool Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => handleToolChange('compress')} className={`${toolButtonClasses} ${activeTool === 'compress' ? activeToolClasses : inactiveToolClasses}`}>Compress</button>
        <button onClick={() => handleToolChange('merge')} className={`${toolButtonClasses} ${activeTool === 'merge' ? activeToolClasses : inactiveToolClasses}`}>Merge</button>
        <button onClick={() => handleToolChange('pdf-to-image')} className={`${toolButtonClasses} ${activeTool === 'pdf-to-image' ? activeToolClasses : inactiveToolClasses}`}>PDF to Image</button>
        <button onClick={() => handleToolChange('image-to-pdf')} className={`${toolButtonClasses} ${activeTool === 'image-to-pdf' ? activeToolClasses : inactiveToolClasses}`}>Image to PDF</button>
      </div>

      {/* Main Tool Area */}
      <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
        {activeTool === 'compress' && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Compress PDF</h3>
            <p className={`${textSecondary} mb-4`}>Reduce the file size of your PDF while optimizing for quality.</p>
            <FileInput file={compressFile} onFileChange={(e) => handleFileChange(e, 'compress')} onClear={() => clearFile('compress')} id="compress-upload" accept="application/pdf" />
            <button onClick={runCompression} disabled={!compressFile || isProcessing} className="mt-4 w-full p-4 rounded-lg bg-blue-500 text-white disabled:opacity-50 flex items-center justify-center gap-3 text-lg font-semibold">
              {isProcessing ? <Loader2 className="animate-spin" /> : <Minimize2 />}
              {isProcessing ? 'Compressing...' : 'Compress PDF'}
            </button>
          </div>
        )}
        {activeTool === 'merge' && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Merge PDFs</h3>
            <p className={`${textSecondary} mb-4`}>Combine two PDF files into a single document.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FileInput file={mergeFiles[0]} onFileChange={(e) => handleFileChange(e, 'merge', 0)} onClear={() => clearFile('merge', 0)} id="merge-upload-1" accept="application/pdf"/>
              <FileInput file={mergeFiles[1]} onFileChange={(e) => handleFileChange(e, 'merge', 1)} onClear={() => clearFile('merge', 1)} id="merge-upload-2" accept="application/pdf"/>
            </div>
            <button onClick={runMerge} disabled={!mergeFiles[0] || !mergeFiles[1] || isProcessing} className="w-full p-4 rounded-lg bg-blue-500 text-white disabled:opacity-50 flex items-center justify-center gap-3 text-lg font-semibold">
              {isProcessing ? <Loader2 className="animate-spin" /> : <Merge />}
              {isProcessing ? 'Merging...' : 'Merge PDFs'}
            </button>
          </div>
        )}
        
        {activeTool === 'pdf-to-image' && (
          <div>
            <h3 className="text-xl font-semibold mb-2">PDF to Image</h3>
            <p className={`${textSecondary} mb-4`}>Convert each page of your PDF into a high-quality PNG image.</p>
            <FileInput file={pdfToImageFile} onFileChange={(e) => handleFileChange(e, 'pdf-to-image')} onClear={() => clearFile('pdf-to-image')} id="pdf-to-image-upload" accept="application/pdf"/>
            <button onClick={runPdfToImage} disabled={!pdfToImageFile || isProcessing} className="mt-4 w-full p-4 rounded-lg bg-blue-500 text-white disabled:opacity-50 flex items-center justify-center gap-3 text-lg font-semibold">
              {isProcessing ? <Loader2 className="animate-spin" /> : <Image />}
              {isProcessing ? 'Converting...' : 'Convert to Images'}
            </button>
          </div>
        )}

        {activeTool === 'image-to-pdf' && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Image to PDF</h3>
            <p className={`${textSecondary} mb-4`}>Combine multiple JPG or PNG images into a single PDF file.</p>
            <FileInput files={imageToPdfFiles} onFileChange={(e) => handleFileChange(e, 'image-to-pdf')} onClear={() => clearFile('image-to-pdf')} id="image-to-pdf-upload" isMultiple={true} accept="image/png, image/jpeg" />
            <button onClick={runImageToPdf} disabled={imageToPdfFiles.length === 0 || isProcessing} className="mt-4 w-full p-4 rounded-lg bg-blue-500 text-white disabled:opacity-50 flex items-center justify-center gap-3 text-lg font-semibold">
              {isProcessing ? <Loader2 className="animate-spin" /> : <FileImage />}
              {isProcessing ? 'Converting...' : 'Convert to PDF'}
            </button>
          </div>
        )}
      </div>

      {/* Result Section */}
      {processedFile && (
        <div className={`mt-6 p-6 rounded-xl border-2 border-green-500 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
          <h3 className="text-xl font-semibold mb-4 text-green-500">Your File is Ready!</h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-semibold">{processedFile.name}</p>
            <button onClick={handleDownload} className="w-full sm:w-auto p-4 rounded-lg bg-green-500 text-white flex items-center justify-center gap-3 font-semibold hover:bg-green-600 transition-all hover:scale-105">
              <FileDown /> Download
            </button>
          </div>
        </div>
      )}

      {processedImages.length > 0 && (
         <div className={`mt-6 p-6 rounded-xl border-2 border-green-500 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
          <h3 className="text-xl font-semibold mb-4 text-green-500">Your Images are Ready!</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {processedImages.map((imgSrc, index) => (
              <div key={index} className="text-center">
                <img src={imgSrc} alt={`Page ${index + 1}`} className="rounded-md border border-gray-300 dark:border-gray-600 mb-2" />
                <button onClick={() => downloadImage(imgSrc, index)} className="w-full text-sm px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                  Page {index + 1}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfTools;