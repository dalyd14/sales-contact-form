import { groq } from "@ai-sdk/groq";
import { generateObject } from 'ai';
import { readFileSync } from 'fs';
import { join } from 'path';
import z from "zod";
import { getDb } from "../../../../lib/db";
import { NextResponse } from "next/server";

const resources = JSON.parse(readFileSync(join(process.cwd(), '../../../../', 'lib', 'resources.json'), 'utf-8'));

export async function POST(request: Request) {
    const db = getDb()
    
    const { prospectId, enrichedData, formSubmission }: { prospectId: string, enrichedData: any, formSubmission: any } = await request.json()

    const result = await generateResources(formSubmission, enrichedData)

    await db.query(`
        UPDATE prospects
        SET ai_resources = $1
        WHERE id = $2
    `, [JSON.stringify(result, null, 2), prospectId])

    return NextResponse.json(result)
}

const generateResources = async (formSubmission: any, enrichedData: any) => {
    const { object} = await generateObject({
        model: groq("moonshotai/kimi-k2-instruct"),
        output: 'array',
        schema: z.enum(resources.map((resource: any) => resource.id)),
        system: `
        Your job is to take the incoming form submission data that has been enriched by a third party tool using the email and the email domain,
        and use that data and figure out which 3 resources are most relevant to share with a prospect, who is waiting for their meeting with a Vercel Sales Rep.

        In the resources, provided, each resource will have a name and description that will help you determine the general idea of the resource.
        
        Then each resource will have a type, blog, documentation, or prompt. Blogs are for non-technical high level employees, docs are a bit more nitty gritty, and prompts
        are for more technical employees specifically interested in v0.

        Then there is a product field, which is either vercel or v0 or vercel and v0. This should align with the form submission interest information.
        You should use this field as a general guidlien on which resources to share with the prospect.

        Finally, there is a tags array field. This is an array of strings that add descriptors to the given resource. You can use these as guidelines on the type of industries or people to 
        recommend the resource to.

        You must pick 3 resources.

        These resources are available to you:
        ${JSON.stringify(resources, null, 2)}
        `,
        prompt: `
        Here is the form submission data:
        ${JSON.stringify(formSubmission, null, 2)}

        And the here is the enriched data based on the email and the email domain:
        ${JSON.stringify(enrichedData, null, 2)}
        `,
    })

    return object;
}

generateResources({
    "email": "john.doe@allbirds.com",
    "country": "United States",
    "productInterest": "vercel",
    "message": "I'm interested in learning more about Vercel's platform."
}, {
    "data": {
      "domain": "allbirds.com",
      "disposable": false,
      "webmail": false,
      "accept_all": false,
      "pattern": "{first}.{last}",
      "organization": "Allbirds",
      "description": "Allbirds is a footwear company that focuses on sustainable and comfortable shoes made from natural materials.",
      "industry": "Retail Apparel and Fashion",
      "twitter": null,
      "facebook": null,
      "linkedin": "https://linkedin.com/company/allbirds",
      "instagram": null,
      "youtube": null,
      "technologies": [
        "cloudflare",
        "dynamic-yield",
        "google-tag-manager",
        "hsts",
        "http-3",
        "onetrust",
        "shopify",
        "track-js"
      ],
      "country": "US",
      "state": "CA",
      "city": "San Francisco",
      "postal_code": null,
      "street": null,
      "headcount": "201-500",
      "company_type": "public company",
      "emails": [
        {
          "value": "kimmy.kline@allbirds.com",
          "type": "personal",
          "confidence": 99,
          "sources": [
            {
              "domain": "linkedin.com",
              "uri": "https://www.google.com/search?q=site:linkedin.com%20kimmy%20kline%20allbirds",
              "extracted_on": "2025-08-09",
              "last_seen_on": "2025-08-08",
              "still_on_page": true
            }
          ],
          "first_name": "Kimmy",
          "last_name": "Kline",
          "position": "Director of Retail Planning",
          "position_raw": "Director of Retail Planning",
          "seniority": "executive",
          "department": "management",
          "linkedin": "https://www.linkedin.com/in/kimmy-kline-56479648",
          "twitter": null,
          "phone_number": null,
          "verification": {
            "date": "2025-08-01",
            "status": "valid"
          }
        },
        {
          "value": "james@allbirds.com",
          "type": "personal",
          "confidence": 99,
          "sources": [
            {
              "domain": "linkedin.com",
              "uri": "https://www.google.com/search?q=site:linkedin.com%20james%20romero%20allbirds",
              "extracted_on": "2025-01-03",
              "last_seen_on": "2025-08-01",
              "still_on_page": true
            }
          ],
          "first_name": "James",
          "last_name": "Romero",
          "position": "Senior Director of Product Management",
          "position_raw": "Senior Director of Product Creation",
          "seniority": "executive",
          "department": "management",
          "linkedin": "https://www.linkedin.com/in/jamesmromero",
          "twitter": null,
          "phone_number": null,
          "verification": {
            "date": "2025-06-24",
            "status": "valid"
          }
        },
        {
          "value": "kris.wolfram@allbirds.com",
          "type": "personal",
          "confidence": 99,
          "sources": [
            {
              "domain": "linkedin.com",
              "uri": "https://www.google.com/search?q=site:linkedin.com%20kris%20wolfram%20allbirds",
              "extracted_on": "2025-01-03",
              "last_seen_on": "2025-07-05",
              "still_on_page": true
            }
          ],
          "first_name": "Kris",
          "last_name": "Wolfram",
          "position": "Senior Manager, HR Business Partner",
          "position_raw": "Sr. Manager, People Business Partner",
          "seniority": "senior",
          "department": "sales",
          "linkedin": "https://www.linkedin.com/in/kris-wolfram-96a22625",
          "twitter": null,
          "phone_number": null,
          "verification": {
            "date": "2025-07-10",
            "status": "valid"
          }
        },
        {
          "value": "kevin.stolle@allbirds.com",
          "type": "personal",
          "confidence": 99,
          "sources": [
            {
              "domain": "linkedin.com",
              "uri": "https://www.google.com/search?q=site:linkedin.com%20kevin%20stolle%20allbirds",
              "extracted_on": "2025-01-03",
              "last_seen_on": "2025-08-12",
              "still_on_page": true
            }
          ],
          "first_name": "Kevin",
          "last_name": "Stolle",
          "position": "Director of Financial Planning and Analysis",
          "position_raw": "Director, FP&A and Strategic Finance",
          "seniority": "executive",
          "department": "finance",
          "linkedin": "https://www.linkedin.com/in/kevinstolle",
          "twitter": null,
          "phone_number": null,
          "verification": {
            "date": "2025-05-21",
            "status": "valid"
          }
        },
        {
          "value": "chris.peters@allbirds.com",
          "type": "personal",
          "confidence": 99,
          "sources": [
            {
              "domain": "linkedin.com",
              "uri": "https://www.google.com/search?q=site:linkedin.com%20chris%20peters%20allbirds",
              "extracted_on": "2025-01-03",
              "last_seen_on": "2025-01-03",
              "still_on_page": true
            }
          ],
          "first_name": "Chris",
          "last_name": "Peters",
          "position": "Director of Product Management",
          "position_raw": "Director of Product Management",
          "seniority": "executive",
          "department": "management",
          "linkedin": "https://www.linkedin.com/in/peters5395",
          "twitter": null,
          "phone_number": null,
          "verification": {
            "date": "2025-06-21",
            "status": "valid"
          }
        },
        {
          "value": "charisse.carroll@allbirds.com",
          "type": "personal",
          "confidence": 99,
          "sources": [
            {
              "domain": "linkedin.com",
              "uri": "https://www.google.com/search?q=site:linkedin.com%20charisse%20carroll%20allbirds",
              "extracted_on": "2025-01-03",
              "last_seen_on": "2025-08-03",
              "still_on_page": true
            }
          ],
          "first_name": "Charisse",
          "last_name": "Carroll",
          "position": "Director of Human Resources",
          "position_raw": "Director, People Success & Talent at Allbirds",
          "seniority": "executive",
          "department": "hr",
          "linkedin": "https://www.linkedin.com/in/charisse-carroll-0808a03",
          "twitter": null,
          "phone_number": null,
          "verification": {
            "date": "2025-07-09",
            "status": "valid"
          }
        },
        {
          "value": "claire.linville@allbirds.com",
          "type": "personal",
          "confidence": 99,
          "sources": [
            {
              "domain": "linkedin.com",
              "uri": "https://www.google.com/search?q=site:linkedin.com%20claire%20linville%20allbirds",
              "extracted_on": "2025-01-03",
              "last_seen_on": "2025-08-05",
              "still_on_page": true
            }
          ],
          "first_name": "Claire",
          "last_name": "Linville",
          "position": "Director of Strategy",
          "position_raw": "Director II, Strategy",
          "seniority": "executive",
          "department": "management",
          "linkedin": "https://www.linkedin.com/in/claire-linville-8968803b",
          "twitter": null,
          "phone_number": null,
          "verification": {
            "date": "2025-08-14",
            "status": "valid"
          }
        },
        {
          "value": "travis@allbirds.com",
          "type": "personal",
          "confidence": 99,
          "sources": [
            {
              "domain": "linkedin.com",
              "uri": "https://www.google.com/search?q=site:linkedin.com%20travis%20boyce%20allbirds",
              "extracted_on": "2025-01-08",
              "last_seen_on": "2025-07-04",
              "still_on_page": true
            },
            {
              "domain": "vitag.com.au",
              "uri": "https://vitag.com.au/the-future-of-retail-pulled-forward",
              "extracted_on": "2024-06-13",
              "last_seen_on": "2024-06-13",
              "still_on_page": true
            }
          ],
          "first_name": "Travis",
          "last_name": "Boyce",
          "position": "Vice President, Business Development",
          "position_raw": "Vice President, Business Development",
          "seniority": "executive",
          "department": "sales",
          "linkedin": "https://www.linkedin.com/in/travis-boyce-1b090225",
          "twitter": null,
          "phone_number": null,
          "verification": {
            "date": "2025-07-31",
            "status": "valid"
          }
        },
        {
          "value": "laura.mallers@allbirds.com",
          "type": "personal",
          "confidence": 98,
          "sources": [
            {
              "domain": "linkedin.com",
              "uri": "https://www.google.com/search?q=site:linkedin.com%20laura%20mallers%20allbirds",
              "extracted_on": "2025-01-08",
              "last_seen_on": "2025-08-14",
              "still_on_page": true
            }
          ],
          "first_name": "Laura",
          "last_name": "Mallers",
          "position": "Senior Director of Reporting and Controls",
          "position_raw": "Senior Director, External Reporting & Internal Controls",
          "seniority": "executive",
          "department": "management",
          "linkedin": "https://www.linkedin.com/in/laura-mallers-b4287b45",
          "twitter": null,
          "phone_number": null,
          "verification": {
            "date": "2025-05-24",
            "status": "valid"
          }
        },
        {
          "value": "erin.sander@allbirds.com",
          "type": "personal",
          "confidence": 98,
          "sources": [
            {
              "domain": "linkedin.com",
              "uri": "https://www.google.com/search?q=site:linkedin.com%20erin%20sander%20allbirds",
              "extracted_on": "2025-01-08",
              "last_seen_on": "2025-07-29",
              "still_on_page": true
            }
          ],
          "first_name": "Erin",
          "last_name": "Sander",
          "position": "Vice President of Product Management",
          "position_raw": "Vice President Product & Merchandising",
          "seniority": "executive",
          "department": "management",
          "linkedin": "https://www.linkedin.com/in/erin-sander-56029b4",
          "twitter": null,
          "phone_number": null,
          "verification": {
            "date": "2025-06-17",
            "status": "valid"
          }
        }
      ],
      "linked_domains": []
    },
    "meta": {
      "results": 86,
      "limit": 10,
      "offset": 0,
      "params": {
        "domain": "allbirds.com",
        "company": null,
        "type": null,
        "seniority": null,
        "department": null
      }
    }
  })