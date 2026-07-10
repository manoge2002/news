const roads = ["A5"];
const warnings = [];
async function test() {
  for (const road of roads) {
    const res = await fetch(`https://verkehr.autobahn.de/o/autobahn/${road}/services/warning`);
    const data = await res.json();
    if (data.warning) warnings.push(...data.warning);
  }
  
  function formatText(t) {
    if (!t) return "";
    return t
      .replace(/Frankfurt am Main/g, "Frankfurt")
      .replace(/\bAS\b/g, "Anschlussstelle")
      .replace(/\bAK\b/g, "Autobahnkreuz")
      .replace(/\bAD\b/g, "Autobahndreieck")
      .replace(/->/g, "→")
      .replace(/\s+-\s+/g, " → ");
  }

  const msgs = warnings.map(w => {
    const road = w.title.split('|')[0].trim();
    const segment = w.title.split('|')[1]?.trim() || w.subtitle?.trim();
    
    let section = w.description.find(d => d.startsWith(`${road}:`));
    if (section) {
       section = section.split(',').slice(1).join(',').trim();
    } else {
       section = w.subtitle?.trim() || "";
    }
    
    const eventsLines = [];
    let inEvents = false;
    for (const line of w.description) {
       if (line === "Ereignismeldung:") {
          inEvents = true;
          continue;
       }
       if (inEvents && line.startsWith("-")) {
          eventsLines.push(line.substring(1).trim());
       }
    }
    const events = eventsLines.join(' • ') || w.description[2] || "Verkehrsbehinderung";

    return {
       text: {
         road: road,
         segment: formatText(segment),
         section: formatText(section),
         events: formatText(events)
       },
       pubStr: "seit " + new Date(w.startTimestamp).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'}) + " Uhr"
    };
  });
  console.log(JSON.stringify(msgs, null, 2));
}
test();
