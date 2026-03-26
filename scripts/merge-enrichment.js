#!/usr/bin/env node
/**
 * Merge Apify enrichment data into alumni.json
 * Sources: Google Maps Scraper + Website Email Finder
 * Run: node scripts/merge-enrichment.js
 */
const fs = require('fs');
const path = require('path');

const alumniPath = path.join(__dirname, '..', 'data', 'alumni.json');
const alumni = JSON.parse(fs.readFileSync(alumniPath, 'utf8'));

// --- Google Maps enrichment (verified matches only) ---
// Format: searchName -> { practice_name, website, google_rating, google_reviews, address, phone }
const gmapsData = {
  "Dr. William Miyazaki": { practice_name: "Dr. William T. Miyazaki, DO", google_rating: 2.7, google_reviews: 22, address: "5990 Silver Lake Rd # C, Reno, NV 89506" },
  "Dr. James Jempsa": { practice_name: "Dr. James C. Jempsa, DO", google_rating: 4.2, google_reviews: 5, address: "890 Mill St #305, Reno, NV 89502" },
  "Dr. Paul Kalekas": { practice_name: "Kalekas Paul J DO", address: "874 American Pacific Dr # 100, Henderson, NV 89014" },
  "Dr. Dale Carrison": { practice_name: "Dale Carrison", address: "1600 Medical Pkwy, Carson City, NV 89703" },
  "Dr. Jack Schnurr": { practice_name: "Dr. Jack A. Schnurr, MD", address: "1600 Medical Pkwy, Carson City, NV 89703" },
  "Dr. David Gothelf": { practice_name: "Intermountain Health", website: "https://doctors.intermountainhealth.org/provider/David%20S%20Gothelf/2820053", google_rating: 4.6, google_reviews: 180, address: "100 N Green Valley Pkwy Suite 240, Henderson, NV 89074" },
  "Dr. Andrea Fong": { practice_name: "Face By Fong", website: "https://facebyfong.com/", google_rating: 5, google_reviews: 18, address: "6980 Smoke Ranch Rd #150, Las Vegas, NV 89128" },
  "Dr. David Wichman": { practice_name: "UMC Southern Nevada", website: "https://www.umcsn.com/", google_rating: 1.5, google_reviews: 8, address: "2202 W Craig Rd, North Las Vegas, NV 89032" },
  "Dr. Gregson Porteous": { practice_name: "Dr. Gregson J. Porteous, DO", address: "7326 W Cheyenne Ave, Las Vegas, NV 89129" },
  "Dr. Brian Hager": { practice_name: "Hager Brian C Do", address: "4470 Palisades Canyon Cir, Las Vegas, NV 89129" },
  "Dr. Daniel Royal": { practice_name: "Turtle Healing Band Clinic", website: "https://www.turtlehealingbandclinic.com/", google_rating: 4.6, google_reviews: 7, address: "2121 E Flamingo Rd UNIT 112, Las Vegas, NV 89119" },
  "Dr. Gregory Hsu": { practice_name: "Shepherd Eye Center", website: "https://www.shepherdeye.com/locations/henderson/", google_rating: 4.8, google_reviews: 2273, address: "2475 W Horizon Ridge Pkwy STE 120, Henderson, NV 89052" },
  "Dr. Daniel Lott": { practice_name: "Dr. Daniel Lott", address: "8906 Spanish Ridge Ave, Las Vegas, NV 89148" },
  "Dr. Ernesto McCombs": { practice_name: "Ernesto A Mccombs D.O", google_rating: 4.2, google_reviews: 26, address: "501 S Rancho Dr Suite C-15, Las Vegas, NV 89106" },
  "Dr. Paul McHugh": { practice_name: "Dr. Paul M. Mchugh, DO", google_rating: 3, google_reviews: 4, address: "1706 W Bonanza Rd, Las Vegas, NV 89106" },
  "Dr. Dana Forte": { practice_name: "Forte Family Practice", website: "https://fortefamilypractice.com/", google_rating: 2.8, google_reviews: 204, address: "9010 W Cheyenne Ave, Las Vegas, NV 89129" },
  "Dr. Steven Sundstrom": { practice_name: "Renown Health", website: "https://www.renown.org/find-a-doctor/steven-sundstrom", google_rating: 5, google_reviews: 10, address: "13945 S Virginia St Suite 632, Reno, NV 89511" },
  "Dr. Lisa Hohl": { practice_name: "Hohl Lisa M Do", google_rating: 1.2, google_reviews: 12, address: "525 Marks St, Henderson, NV 89014" },
  "Dr. Ryan Hampton": { practice_name: "Ryan Hampton", google_rating: 1, google_reviews: 2, address: "10624 S Eastern Ave, Henderson, NV 89052" },
  "Dr. Jason Castillo": { practice_name: "Jason Castillo", google_rating: 5, google_reviews: 2, address: "4270 S Decatur Blvd B6, Las Vegas, NV 89103" },
  "Dr. Roya Mahana": { practice_name: "ROYA LAURA MAHANA", address: "3100 N Tenaya Wy, Las Vegas, NV 89128" },
  "Dr. Aria Fazlinejad": { practice_name: "MDVIP", website: "https://www.mdvip.com/doctors/ariafazlinejaddo", address: "9333 W Sunset Rd suite a, Las Vegas, NV 89148" },
  "Dr. Anthony Nguyen": { practice_name: "Comprehensive Cancer Centers", website: "https://cccnevada.com/doctor/anthony-v-nguyen-md/", google_rating: 4.9, google_reviews: 100, address: "1505 Wigwam Pkwy #130, Henderson, NV 89074" },
  "Dr. Tyler Witzel": { practice_name: "Intermountain Health", website: "https://doctors.intermountainhealth.org/provider/Tyler%20Witzel/3216693", google_rating: 4.9, google_reviews: 88, address: "6210 N Durango Dr, Las Vegas, NV 89149" },
  "Dr. Nelly Chow": { practice_name: "Heart and Lung NV", website: "https://heartandlungnv.com/physicians/profile/Dr-Nelly-Chow-DO", google_rating: 5, google_reviews: 5, address: "3150 N Tenaya Wy Ste 260, Las Vegas, NV 89128" },
  "Dr. Jason Lao": { practice_name: "Intermountain Health", website: "https://doctors.intermountainhealth.org/provider/Jason%20Lao/5836899", address: "11011 W Charleston Blvd, Las Vegas, NV 89135" },
  "Dr. Kevin Urmaza": { practice_name: "Intermountain Health", website: "https://doctors.intermountainhealth.org/provider/Kevin%20Urmaza/3216696", google_rating: 4.9, google_reviews: 127, address: "2825 Siena Heights Dr, Henderson, NV 89052" },
  "Dr. Lonnie Empey": { practice_name: "LONNIE R EMPEY", address: "10624 S Eastern Ave A955, Henderson, NV 89052" },
  "Dr. Stephanie Davidson": { practice_name: "Dr. Stephanie L. Davidson, DO", address: "7220 S Cimarron Rd, Las Vegas, NV 89113" },
  "Dr. Karyn Harries": { practice_name: "CenterWell Primary Care", website: "https://www.centerwellprimarycare.com/", google_rating: 4.1, google_reviews: 14, address: "4919 W Craig Rd, Las Vegas, NV 89130" },
  "Dr. Raafat Khani": { practice_name: "UMC Southern Nevada", website: "https://www.umcsn.com/", address: "61 N Nellis Blvd UNIT 61, Las Vegas, NV 89110" },
  "Dr. Kevin Slaughter": { practice_name: "KEVIN T SLAUGHTER", google_rating: 1, google_reviews: 1, address: "10001 S Eastern Ave, Henderson, NV 89052" },
  "Dr. Darrin Houston": { practice_name: "Dr. Darrin F. Houston, DO", address: "500 N Rainbow Blvd # 203, Las Vegas, NV 89107" },
  "Dr. Jason McKenzie": { practice_name: "Renown Health", website: "https://www.renown.org/find-a-doctor/jason-mckenzie", google_rating: 2.4, google_reviews: 19, address: "480 E Prater Way, Sparks, NV 89431" },
  "Dr. Bruce Fong": { practice_name: "Sierra Integrative Medical Center", website: "https://www.sierraintegrative.com/", google_rating: 4.2, google_reviews: 20, address: "521 Hammill Ln, Reno, NV 89511" },
  "Dr. Ralph Herbig": { practice_name: "Carson Valley Health", website: "https://carsonvalleyhealth.org/providers/ralph-herbig-do/", google_rating: 3, google_reviews: 4, address: "897 Ironwood Dr, Minden, NV 89423" },
  "Dr. Newton Yco": { practice_name: "Reno Family Physicians", website: "https://www.renofamilyphysicians.com/", google_rating: 2.9, google_reviews: 69, address: "7111 S Virginia St # A, Reno, NV 89511" },
  "Dr. Mehrdad Ferdowsian": { practice_name: "Dr. Mehrdad M. Ferdowsian, DO", google_rating: 2.7, google_reviews: 3, address: "4830 W Lone Mountain Rd, Las Vegas, NV 89130" },
  "Dr. Leroy Fellows": { practice_name: "Leroy Fellows", address: "1800 W Charleston Blvd, Las Vegas, NV 89102" },
  "Dr. Kochy Tang": { practice_name: "Kochy Y. Tang, DO", google_rating: 3.5, google_reviews: 8, address: "12300 S Las Vegas Blvd, Henderson, NV 89044" },
  "Dr. Gaynelle Rolling": { practice_name: "Women's Specialty Care", website: "https://www.womensspecialtycare.com/", address: "6990 Smoke Ranch Rd, Las Vegas, NV 89128" },
  "Dr. Xin Liu": { practice_name: "AOSM Las Vegas", website: "https://www.aosmlv.com/", google_rating: 4.8, google_reviews: 429, address: "7195 Advanced Way, Las Vegas, NV 89113" },
  "Dr. Katherine McClanahan": { practice_name: "Katherine Mcclanahan", address: "10624 S Eastern Ave A955, Henderson, NV 89052" },
  "Dr. Damon Zavala": { practice_name: "Renown Health", website: "https://www.renown.org/", address: "1155 Mill St, Reno, NV 89502" },
  "Dr. Sangeeta Wagner": { practice_name: "Northern Nevada Medical Group", website: "https://nnmg.com/", address: "5265 Vista Blvd Bldg B, Sparks, NV 89436" },
  "Dr. Aron Rogers": { practice_name: "Dr. Aron Rogers, DO", address: "3960 W Craig Rd #101, North Las Vegas, NV 89032" },
  "Dr. Branavan Umakanthan": { practice_name: "Nevada Heart & Vascular Center", website: "https://nevadaheart.com/", google_rating: 5, google_reviews: 6, address: "3150 N Tenaya Wy #320, Las Vegas, NV 89128" },
  "Dr. Ruchi Garg": { practice_name: "Sunrise Hospital", website: "https://www.sunrisehospital.com/", address: "3186 S Maryland Pkwy, Las Vegas, NV 89109" },
  "Dr. Christopher Gadomski": { practice_name: "Dr. Christopher J. Gadomski, DO", address: "650 N Nellis Blvd, Las Vegas, NV 89110" },
  "Dr. Spencer Mellum": { practice_name: "Dr. Spencer T. Mellum, DO", google_rating: 3, google_reviews: 2, address: "680 W Nye Ln, Carson City, NV 89703" },
  "Dr. Alison Tam": { practice_name: "Plastic Surgery Vegas", website: "https://www.plasticsurgeryvegas.com/", google_rating: 4.7, google_reviews: 12, address: "8530 W Sunset Rd UNIT 130, Las Vegas, NV 89113" },
  "Dr. Samantha Schoenhaus": { practice_name: "Dr. Samantha Schoenhaus", google_rating: 4.4, google_reviews: 228, address: "2580 St Rose Pkwy #140, Henderson, NV 89074" },
  "Dr. David Hammer": { practice_name: "Hammer David B DO", address: "129 W Lake Mead Pkwy # B-18, Henderson, NV 89015" },
  "Dr. Barry Ewell": { practice_name: "Dr. Barry A. Ewell, DO", address: "2450 W Charleston Blvd, Las Vegas, NV 89102" },
  "Dr. David Obert": { practice_name: "Emergency Physicians' Medical", address: "901 S Rancho Ln # 135, Las Vegas, NV 89106" },
  "Dr. Marian Orr": { practice_name: "UNLV School of Medicine", address: "4000 E Charleston Blvd # C222, Las Vegas, NV 89104" },
  "Dr. Joshua Rosenberg": { practice_name: "Steinberg Diagnostic Medical Imaging", website: "https://www.sdmi-lv.com/", google_rating: 4.7, google_reviews: 2964, address: "2767 N Tenaya Wy, Las Vegas, NV 89128" },
  "Dr. DeRek Goffstein": { practice_name: "Dr. Derek M. Goffstein, DO", google_rating: 5, google_reviews: 3, address: "102 E Lake Mead Pkwy, Henderson, NV 89015" },
  "Dr. Edward Solis": { practice_name: "Solis Edward R DO", address: "129 W Lake Mead Pkwy # B-18, Henderson, NV 89015" },
  "Dr. George Tsao": { practice_name: "George Tsao", google_rating: 5, google_reviews: 1, address: "7021 Spring Mountain Rd, Las Vegas, NV 89117" },
  "Dr. John Gull": { practice_name: "Dr. John D. Gull, DO", google_rating: 5, google_reviews: 7, address: "1784 Browning Way Suite 120, Elko, NV 89801" },
  "Dr. Kaveh Kashani": { practice_name: "Kaveh Kashani", google_rating: 5, google_reviews: 1, address: "7155 S Rainbow Blvd # 200, Las Vegas, NV 89118" },
  "Dr. Charles Watt": { practice_name: "Dr. Charles G. Watt", address: "6970 W Patrick Ln Suite 140, Las Vegas, NV 89113" },
  "Dr. Edward Van Vooren": { practice_name: "Desert Radiology", website: "https://www.desertrad.com/", google_rating: 4.7, google_reviews: 3899, address: "2020 Palomino Ln 100 Ste 100, Las Vegas, NV 89106" },
  "Dr. Stephanie Lehrner": { practice_name: "Village Medical", website: "https://www.villagemedical.com/", google_rating: 3.8, google_reviews: 32, address: "3425 Cliff Shadows Pkwy #250, Las Vegas, NV 89129" },
  "Dr. Juan Borja": { practice_name: "Juan P. Borja, DO", google_rating: 4.7, google_reviews: 70, address: "4490 N Rancho Dr, Las Vegas, NV 89130" },
  "Dr. Joseph Jeppson": { practice_name: "Mesa View Medical", website: "https://mesaviewmedical.com/providers/internal-medicine-providers/joseph-j-jeppson-do/", google_rating: 5, google_reviews: 2, address: "1301 Bertha Howe Ave Ste 1, Mesquite, NV 89027" },
  "Dr. Leslie DeNton": { practice_name: "UMC Southern Nevada", website: "https://www.umcsn.com/", google_rating: 5, google_reviews: 1, address: "1800 W Charleston Blvd, Las Vegas, NV 89102" },
  "Dr. Angela Ortega-Bermudez": { practice_name: "Angela Ortega-Bermudez, DO", google_rating: 4.1, google_reviews: 11, address: "2847 St Rose Pkwy #150, Henderson, NV 89052" },
  "Dr. Daniel Park": { practice_name: "Alliance Mental Health Services", website: "https://www.alliancemhs.com/", google_rating: 5, google_reviews: 1, address: "4270 S Decatur Blvd, Las Vegas, NV 89103" },
  "Dr. Tanya Phares": { practice_name: "Center for Health Internal Medicine", website: "https://www.centerforhealthimreno.com/", google_rating: 4.7, google_reviews: 118, address: "645 N Arlington Ave # 600, Reno, NV 89503" },
  "Dr. Jonathan Wirjo": { practice_name: "Focus Mental Health", website: "https://www.focusmentalhealth.com/meet-our-team/about-jonathan-wirjo/", address: "3016 W Charleston Blvd Ste 150, Las Vegas, NV 89102" },
  "Dr. Joel Abbott": { practice_name: "Pacific West Urology", website: "https://www.pacificwesturology.com/", google_rating: 4, google_reviews: 20, address: "4425 S Pecos Rd, Las Vegas, NV 89121" },
  "Dr. Vincent Ho": { practice_name: "Vincent Ho", google_rating: 4.1, google_reviews: 9, address: "870 Seven Hills Dr #203, Henderson, NV 89052" },
  "Dr. Russell Lauver": { practice_name: "Russell Lauver", address: "3001 St Rose Pkwy, Henderson, NV 89052" },
  "Dr. Nelson Lopez": { practice_name: "Eye Clinic of Las Vegas", google_rating: 2, google_reviews: 7, address: "3100 W Charleston Blvd, Las Vegas, NV 89102" },
  "Dr. Mustafa Rawaf": { practice_name: "Focus Mental Health", website: "https://www.focusmentalhealth.com/", google_rating: 5, google_reviews: 1, address: "3016 W Charleston Blvd, Las Vegas, NV 89102" },
  "Dr. Natalie Lewman": { practice_name: "Renown Health", website: "https://www.renown.org/find-a-doctor/natalie-lewman", address: "1495 Mill St, Reno, NV 89502" },
  "Dr. Stephen Hewitt": { practice_name: "Stephen Hewitt", address: "1600 Medical Pkwy, Carson City, NV 89703" },
  "Dr. Victor Yoon": { practice_name: "Victor Yoon", google_rating: 5, google_reviews: 8, address: "6240 N Durango Dr #120, Las Vegas, NV 89149" },
  "Dr. Tabreez Ali": { practice_name: "Dr. Tabreez Ali, DO", google_rating: 3, google_reviews: 2, address: "11272 Sanbury Brook St, Las Vegas, NV 89183" },
  "Dr. Iqra Saqib": { practice_name: "IQRA SAQIB", google_rating: 3, google_reviews: 2, address: "10624 S Eastern Ave A955, Henderson, NV 89052" },
  "Dr. Tarik Alshaikh": { practice_name: "Focus Mental Health", website: "https://www.focusmentalhealth.com/meet-our-team/about-tarik-alshaikh/", address: "3016 W Charleston Blvd Ste 150, Las Vegas, NV 89102" },
  "Dr. Clement Strumillo": { practice_name: "Dr. Clement Strumillo", address: "6 Steptoe Cir, Ely, NV 89301" },
  "Dr. Lance Allgower": { practice_name: "Sunrise Hospital", website: "https://www.sunrisehospital.com/", address: "Las Vegas, NV 89169" },
  "Dr. Diana Hung": { practice_name: "Comprehensive Cancer Centers", website: "https://cccnevada.com/doctor/diana-hung-d-o/", address: "3131 La Canada St #134, Las Vegas, NV 89169" },
  "Dr. Dylan Rogers": { practice_name: "Crovetti Orthopaedics", website: "https://www.crovettiortho.com/dr-dylan-rogers/", address: "2779 W Horizon Ridge Pkwy, Henderson, NV 89052" },
  "Dr. Kelly Kaneshiro": { practice_name: "Anesthesiology NV", website: "https://www.anesnv.com/", google_rating: 5, google_reviews: 1, address: "1325 Airmotive Wy #214, Reno, NV 89502" },
  "Dr. Luigi Mangiacotti": { practice_name: "Sierra Neurosurgery Group", website: "https://www.sierraneurosurgery.com/", google_rating: 4.7, google_reviews: 494, address: "5590 Kietzke Ln Ste 101, Reno, NV 89511" },
  "Dr. Donald Pennington": { practice_name: "Orthopedics & Sports Medicine", website: "https://www.orthopedics-sportsmedicine.com/", google_rating: 4.6, google_reviews: 31, address: "9499 W Charleston Blvd #200, Las Vegas, NV 89117" },
  "Dr. Justin Puopolo": { practice_name: "Pueblo Medical Imaging", website: "https://pmilv.com/", google_rating: 4.7, google_reviews: 2107, address: "5495 S Rainbow Blvd # 101, Las Vegas, NV 89118" },
  "Dr. Daniel Krauchuk": { practice_name: "Nevada Muscle and Nerve", website: "https://nvmusclenerve.com/", google_rating: 4.2, google_reviews: 6, address: "3017 W Charleston Blvd #90, Las Vegas, NV 89102" },
  "Dr. Brittnee Zmuda": { practice_name: "Henderson Direct Primary Care", website: "https://www.hendersondpc.com/", google_rating: 4.7, google_reviews: 72, address: "3041 W Horizon Ridge Pkwy Suite 165, Henderson, NV 89052" },
  "Dr. Kevin Miles": { practice_name: "Renown Medical Group PMR", website: "https://www.renown.org/", google_rating: 5, google_reviews: 1, address: "1495 Mill St, Reno, NV 89502" },
  "Dr. Amir Kilani": { practice_name: "Las Vegas Radiology", website: "https://www.lvradiology.com/", google_rating: 4.7, google_reviews: 723, address: "7500 Smoke Ranch Rd STE 100, Las Vegas, NV 89128" },
  "Dr. My Huyen Le": { practice_name: "Internal Medicine Specialists of Las Vegas", website: "https://www.imslasvegas.com/", google_rating: 3.5, google_reviews: 52, address: "2010 Wellness Wy #100, Las Vegas, NV 89106" },
  "Dr. Fan Zhang": { practice_name: "NeuroCenter of Nevada", website: "https://neurocnv.com/steven-fan-zhang-md/", google_rating: 4.8, google_reviews: 179, address: "2020 Wellness Wy #300, Las Vegas, NV 89106" },
};

// --- Email enrichment (domain -> emails) ---
const emailData = {
  "facebyfong.com": ["facebyfong@gmail.com"],
  "fortefamilypractice.com": ["generalinquiries@fortefamilypractice.com"],
  "centerforhealthimreno.com": ["bethanya@centerforhealthimreno.com"],
  "focusmentalhealth.com": ["focus@focusmentalhealth.com", "newpatient@focusmentalhealth.com"],
  "pacificwesturology.com": ["contact@pacificwesturology.com"],
  "desertrad.com": ["info@desertrad.com"],
  "renofamilyphysicians.com": ["info@renofamilyphysicians.com"],
  "nevadaheart.com": ["info@nevadaheart.com"],
  "neurocnv.com": ["info@neurocnv.com"],
  "sdmi-lv.com": ["comments@sdmi-lv.com"],
  "crovettiortho.com": ["REFERRAL@crovettiortho.com"],
  "sierraneurosurgery.com": ["info@sierraneurosurgery.com"],
  "pmilv.com": ["info@pmilv.com"],
  "hendersondpc.com": ["drlabuz@hendersondpc.com"],
  "carsonvalleyhealth.org": ["info@carsonvalleyhealth.org"],
  "whasn.com": ["contact@whasn.com"],
  "nevadaorthopedic.com": ["workcomp@nevadaorthopedic.com"],
  "cccnevada.com": ["info@cccnevada.com"],
  "sierraintegrative.com": ["info@sierraintegrative.com"],
  "orthopedics-sportsmedicine.com": ["info@orthopedics-sportsmedicine.com"],
  "nvmusclenerve.com": ["info@nvmusclenerve.com"],
  "aosmlv.com": ["info@aosmlv.com"],
  "imslasvegas.com": ["info@imslasvegas.com"],
  "alliancemhs.com": ["info@alliancemhs.com"],
  "shepherdeye.com": ["info@shepherdeye.com"],
  "womensspecialtycare.com": ["info@womensspecialtycare.com"],
  "plasticsurgeryvegas.com": ["info@plasticsurgeryvegas.com"],
  "lvradiology.com": ["info@lvradiology.com"],
  "nnmg.com": ["info@nnmg.com"],
  "mesaviewmedical.com": ["info@mesaviewmedical.com"],
};

// Helper: extract domain from URL
function getDomain(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch { return null; }
}

// Stats
let enriched = 0, websitesAdded = 0, emailsAdded = 0, ratingsAdded = 0, practiceNamesAdded = 0;

// Merge
for (const a of alumni) {
  const gm = gmapsData[a.name];
  if (!gm) continue;

  enriched++;

  // Practice name
  if (gm.practice_name && !a.professional.practice_name) {
    a.professional.practice_name = gm.practice_name;
    practiceNamesAdded++;
  }

  // Website
  if (gm.website && !a.professional.practice_website) {
    a.professional.practice_website = gm.website;
    websitesAdded++;
  }

  // Google rating
  if (gm.google_rating !== undefined) {
    a.professional.google_rating = gm.google_rating;
    a.professional.google_reviews = gm.google_reviews || 0;
    ratingsAdded++;
  }

  // Verified address from Google Maps
  if (gm.address) {
    a.professional.verified_address = gm.address;
  }

  // Email from domain mapping
  const domain = getDomain(gm.website);
  if (domain && emailData[domain] && !a.contact.email) {
    a.contact.email = emailData[domain][0]; // Primary email
    a.contact.email_source = "apify_website_scraper";
    a.contact.email_type = emailData[domain][0].includes("info@") || emailData[domain][0].includes("contact@") ? "practice_general" : "practice_direct";
    emailsAdded++;
  }

  // Mark enrichment
  a.contact.enriched = true;
  a.contact.enrichment_date = "2026-03-26";
}

// Write
fs.writeFileSync(alumniPath, JSON.stringify(alumni, null, 2));

console.log('=== Enrichment Merge Complete ===');
console.log(`Alumni matched:      ${enriched}`);
console.log(`Practice names added: ${practiceNamesAdded}`);
console.log(`Websites added:      ${websitesAdded}`);
console.log(`Ratings added:       ${ratingsAdded}`);
console.log(`Emails added:        ${emailsAdded}`);
console.log(`Total alumni:        ${alumni.length}`);
