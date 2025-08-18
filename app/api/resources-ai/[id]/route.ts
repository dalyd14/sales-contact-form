import { NextResponse } from "next/server";
import { generateObject } from 'ai';
import { groq } from "@ai-sdk/groq";
import z from "zod";

import { getDb } from "@/lib/db";
import resources from "@/lib/resources.json"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const prospectId = id;

    const db = getDb()
    
    const { enrichedData, formSubmission }: { enrichedData: any, formSubmission: any } = await request.json()

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

// generateResources({
//     "email": "john.doe@allbirds.com",
//     "country": "United States",
//     "productInterest": "vercel",
//     "message": "I'm interested in learning more about Vercel's platform."
// }, {
//     "person": {
//       "id": "3631883d-9cb4-52ce-a10e-16f0311a17a0",
//       "name": {
//         "fullName": "Chris Peters",
//         "givenName": "Chris",
//         "familyName": "Peters"
//       },
//       "email": "chris.peters@allbirds.com",
//       "location": "Greater Chicago Area",
//       "timeZone": null,
//       "utcOffset": null,
//       "geo": {
//         "city": null,
//         "state": null,
//         "stateCode": null,
//         "country": "United States",
//         "countryCode": "US",
//         "lat": null,
//         "lng": null
//       },
//       "bio": null,
//       "site": null,
//       "avatar": null,
//       "employment": {
//         "domain": "allbirds.com",
//         "name": "Allbirds",
//         "title": "Director of Product Management",
//         "role": "management",
//         "subRole": null,
//         "seniority": "executive"
//       },
//       "facebook": {
//         "handle": null
//       },
//       "github": {
//         "handle": null,
//         "id": null,
//         "avatar": null,
//         "company": null,
//         "blog": null,
//         "followers": null,
//         "following": null
//       },
//       "twitter": {
//         "handle": null,
//         "id": null,
//         "bio": null,
//         "followers": null,
//         "following": null,
//         "statuses": null,
//         "favorites": null,
//         "location": null,
//         "site": null,
//         "avatar": null
//       },
//       "linkedin": {
//         "handle": "peters5395"
//       },
//       "googleplus": {
//         "handle": null
//       },
//       "gravatar": {
//         "handle": null,
//         "urls": [],
//         "avatar": null,
//         "avatars": []
//       },
//       "fuzzy": false,
//       "emailProvider": "google.com",
//       "indexedAt": "2025-01-03",
//       "phone": null,
//       "activeAt": "2025-06-21",
//       "inactiveAt": null
//     },
//     "company": {
//       "id": "8c14e6f1-08e8-5f9d-bfdd-96bec5a40d3a",
//       "name": "Allbirds",
//       "legalName": "Allbirds",
//       "domain": "allbirds.com",
//       "domainAliases": [],
//       "site": {
//         "phoneNumbers": [
//           "+1 888 963 8944"
//         ],
//         "emailAddresses": [
//           "bulkorders@allbirds.com",
//           "press@allbirds.com",
//           "help@allbirds.com",
//           "together@allbirds.com",
//           "info_impressum@allbirds.com",
//           "support@allbirds.com",
//           "sustainability@allbirds.com",
//           "first@allbirds.com",
//           "hello@allbirds.com",
//           "info@allbirds.com",
//           "legal@allbirds.com",
//           "joinus-jp@allbirds.com",
//           "loungers@allbirds.com"
//         ]
//       },
//       "category": {
//         "sector": null,
//         "industryGroup": null,
//         "industry": null,
//         "subIndustry": null,
//         "gicsCode": "25504010",
//         "sicCode": "56",
//         "sic4Codes": [
//           "56"
//         ],
//         "naicsCode": "44",
//         "naics6Codes": [
//           "448110"
//         ],
//         "naics6Codes2022": [
//           "458110"
//         ]
//       },
//       "tags": [
//         "footwear",
//         "fashion",
//         "sustainability",
//         "retail",
//         "e-commerce"
//       ],
//       "description": "Allbirds is a footwear company that focuses on sustainable and comfortable shoes made from natural materials.",
//       "foundedYear": 2016,
//       "location": "San Francisco, California, United States",
//       "timeZone": "America/Los_Angeles",
//       "utcOffset": -8,
//       "geo": {
//         "streetNumber": null,
//         "streetName": null,
//         "subPremise": null,
//         "streetAddress": null,
//         "city": "San Francisco",
//         "postalCode": null,
//         "state": "California",
//         "stateCode": "CA",
//         "country": "United States",
//         "countryCode": "US",
//         "lat": 37.77493,
//         "lng": -122.41942
//       },
//       "logo": "https://logo.clearbit.com/allbirds.com",
//       "facebook": {
//         "handle": null,
//         "likes": null
//       },
//       "linkedin": {
//         "handle": "company/allbirds"
//       },
//       "twitter": {
//         "handle": null,
//         "id": null,
//         "bio": null,
//         "followers": null,
//         "following": null,
//         "location": null,
//         "site": null,
//         "avatar": null
//       },
//       "crunchbase": {
//         "handle": null
//       },
//       "youtube": {
//         "handle": null
//       },
//       "emailProvider": "google.com",
//       "type": "public",
//       "ticker": "BIRD",
//       "identifiers": {
//         "usEIN": null
//       },
//       "phone": "+1 888 963 8944",
//       "metrics": {
//         "alexaUsRank": null,
//         "alexaGlobalRank": null,
//         "trafficRank": "very_high",
//         "employees": "251-1K",
//         "marketCap": null,
//         "raised": null,
//         "annualRevenue": null,
//         "estimatedAnnualRevenue": null,
//         "fiscalYearEnd": null
//       },
//       "indexedAt": "2025-09-18",
//       "tech": [
//         "cloudflare",
//         "dynamic-yield",
//         "google-tag-manager",
//         "hsts",
//         "http-3",
//         "onetrust",
//         "shopify",
//         "track-js"
//       ],
//       "techCategories": [
//         "conversion_optimization",
//         "data_management",
//         "dns",
//         "ecommerce",
//         "monitoring",
//         "security",
//         "tag_management",
//         "web_servers"
//       ],
//       "fundingRounds": [],
//       "parent": {
//         "domain": null
//       },
//       "ultimateParent": {
//         "domain": null
//       }
//     }
//   })
