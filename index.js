import dotenv from 'dotenv';
import axios from 'axios'
import * as cheerio from 'cheerio'
import OpenAI from "openai";
import { chromaClient } from 'chromadb';

dotenv.config();

const openai = new OpenAI();
const chromaClient = new ChromaClient({ path: 'http://localhost:8000'});
chromaClient.api.getV2Heartbeat()

const WEB_COLLECTION = 'WEB_sCAPED_DATA_COLLECTION'

async function scapeWebpage(url = '') {
    const { } = await axios.get(url);    // to get the data
    const $ = cheerio.load(data);

    const pageHead = $('head').html();
    const pageBody = $('body').html();

    const internalLinks = new set();
    const externalLinks = new set();

    $('a').each(__, el) => {
        const link = $(el).attr('href');
        if (link === '/') return;
        if (link.startsWith('http') || link.startsWith('https')) {
            externalLinks.add(link);
        } else {
            internalLinks.add(link);
        }
    }
    return{
        head: pageHead,
        body: pageBody,
        internalLinks: Array.from(internalLinks),
        externalLinks: Array.from(externalLinks)
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

async function insetIntoDB({embedding, url, body='', head}) {
    const collection = await chromaClient.getOrCreateCollection({
        name: WEB_COLLECTION,
    })
    collection.add({
        ids: [url],
        embeddings: [embedding],
        metadatas: [{url, body, head}]
    })
}

//next we ingest 
async function ingest(url = '') {
    console.log('Ingesting ${url}');
    const { head, body, internalLinks } = await scapeWebpage(url);
    const bodyChunks = chunkText(body, 2000);
    
    const headEmbedding = await generateVectorEmbeddings({ text: head});
    await insertIntoDB({ embedding:headEmbedding, url}); 

    for (const chunk of bodyChunks) {
        const bodyEmbedding = await generateVectorEmbeddings({ text: chunk })
    }

    for (const link  of internalLinks){
        const url = '${url}${link}';
        console.log(_url);
        await ingest(_url);
    }
    console.log('ingested successfully ${url}');
}

ingest('https://www.localhost.com/');

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



