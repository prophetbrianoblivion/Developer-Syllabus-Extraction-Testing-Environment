import mammoth from 'mammoth';
import * as PDFJS from 'pdfjs-dist';
import JSZip from 'jszip';
import { supabase } from '../api/supabaseClient';

// Set the worker source for PDF.js
const pdfjsWorker = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url);
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker.toString();

export interface ProcessedDocument {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    pageCount?: number;
    wordCount: number;
    byteSize: number;
    processingTime: number;
  };
  error?: string;
}

/**
 * Process a Word document and extract its text content
 */
export const processDocx = async (file: File): Promise<ProcessedDocument> => {
  const startTime = performance.now();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    const endTime = performance.now();
    return {
      text,
      metadata: {
        fileName: file.name,
        fileType: 'docx',
        wordCount: text.split(/\s+/).length,
        byteSize: file.size,
        processingTime: endTime - startTime
      }
    };
  } catch (error) {
    console.error('Error processing DOCX file:', error);
    return {
      text: '',
      metadata: {
        fileName: file.name,
        fileType: 'docx',
        wordCount: 0,
        byteSize: file.size,
        processingTime: performance.now() - startTime
      },
      error: `Failed to process DOCX: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Process a PDF document and extract its text content
 */
export const processPdf = async (file: File): Promise<ProcessedDocument> => {
  const startTime = performance.now();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const pageTexts: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      pageTexts.push(pageText);
    }
    
    fullText = pageTexts.join('\n\n');
    
    const endTime = performance.now();
    return {
      text: fullText,
      metadata: {
        fileName: file.name,
        fileType: 'pdf',
        pageCount: pdf.numPages,
        wordCount: fullText.split(/\s+/).length,
        byteSize: file.size,
        processingTime: endTime - startTime
      }
    };
  } catch (error) {
    console.error('Error processing PDF file:', error);
    return {
      text: '',
      metadata: {
        fileName: file.name,
        fileType: 'pdf',
        wordCount: 0,
        byteSize: file.size,
        processingTime: performance.now() - startTime
      },
      error: `Failed to process PDF: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Process a Word document from a zip file
 */
export const processDocxFromZip = async (zipFile: ArrayBuffer, fileName: string): Promise<ProcessedDocument> => {
  const startTime = performance.now();
  try {
    const zip = await JSZip.loadAsync(zipFile);
    const doc = await zip.file('word/document.xml')?.async('text');
    
    if (!doc) {
      throw new Error('Invalid DOCX file structure');
    }
    
    // Basic XML parsing to extract text
    const text = doc
      .replace(/<[^>]+>/g, ' ') // Remove XML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    const endTime = performance.now();
    return {
      text,
      metadata: {
        fileName,
        fileType: 'docx',
        wordCount: text.split(/\s+/).length,
        byteSize: zipFile.byteLength,
        processingTime: endTime - startTime
      }
    };
  } catch (error) {
    console.error('Error processing DOCX from ZIP:', error);
    return {
      text: '',
      metadata: {
        fileName,
        fileType: 'docx',
        wordCount: 0,
        byteSize: zipFile.byteLength,
        processingTime: performance.now() - startTime
      },
      error: `Failed to process DOCX from ZIP: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Upload a document to Supabase storage
 */
export const uploadToStorage = async (file: File, sessionId: string): Promise<string> => {
  const fileName = `${sessionId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return data.path;
};

/**
 * Process a document based on its file type
 */
export const processDocument = async (file: File): Promise<ProcessedDocument> => {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  switch (fileType) {
    case 'docx':
      return processDocx(file);
    case 'pdf':
      return processPdf(file);
    case 'zip': {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docxFiles = Object.keys(zip.files).filter(name => name.endsWith('.docx'));
      
      if (docxFiles.length === 0) {
        return {
          text: '',
          metadata: {
            fileName: file.name,
            fileType: 'zip',
            wordCount: 0,
            byteSize: file.size,
            processingTime: 0
          },
          error: 'No DOCX files found in ZIP archive'
        };
      }
      
      // Process the first DOCX file found
      const docxData = await zip.file(docxFiles[0])?.async('arraybuffer');
      if (!docxData) {
        throw new Error('Failed to extract DOCX from ZIP');
      }
      
      return processDocxFromZip(docxData, docxFiles[0]);
    }
    default:
      return {
        text: '',
        metadata: {
          fileName: file.name,
          fileType: fileType || 'unknown',
          wordCount: 0,
          byteSize: file.size,
          processingTime: 0
        },
        error: `Unsupported file type: ${fileType}`
      };
  }
};