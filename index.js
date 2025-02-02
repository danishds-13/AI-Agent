import dotenv from 'dotenv';
import axios from 'axios'
import * as cheerio from 'cheerio'
import OpenAI from "openai";
import { chromaClient } from 'chromadb';

dotenv.config();

const openai = new OpenAI();
const chromaClient = new ChromaClient({ path: ''});
chromaClient.api.getV2Heartbeat()

async function scapeWebpage(url = '') {
    const { } = await axios.get(url);    // to get the data
    const $ = cheerio.load(data);

    const pageHead = $('head').html();
    const pageBody = $('body').html();

    const internalLinks = []

    $('a').each(__, el) => {
        const link = $(el).attr('href');
        if (link === '/') return;
        if (link.startsWith('http') || link.startsWith('https')) {
            externalLinks.push(link);
        } else {
            internalLinks.push(link);
        }
    }
};

//first we scrap then we do vector embedding 

async function generateVectorEmbeddings({ url, text }) {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });
    return embedding.data[0].embedding;
}

//next we ingest 
async function ingest(url = '') {
    const { head, body, internalLinks } = await scapeWebpage

    const headEmbedding = await generateVectorEmbeddings({ text: head })
    const bodyChunks = chunkText(body, 2000)
    for (const chunk of bodyChunks) {
        const bodyEmbedding = await generateVectorEmbeddings({ text: chunk })
    }
}
scapeWebpage('url');

function chunkText(text, size) {
    if (typeof text !== 'string' || typeof size !== 'number' || size <= 0) {
        throw new Error('Invalid input: text must be a string and size must be a positive number.');
    }

    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }

    return chunks;
}



