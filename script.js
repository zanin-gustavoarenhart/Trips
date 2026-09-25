const config = window.TRAVEL_CONFIG || { countries: {}, brazilStates: {} };
const visitedCountries = new Set(Object.entries(config.countries).filter(([, value]) => value === true).map(([code]) => code));
const visitedStates = new Set(Object.entries(config.brazilStates).filter(([, value]) => value === true).map(([code]) => code));
if (visitedStates.size) visitedCountries.add("BR");

const COLORS = {
  land: "#f2f2f2",
  visited: "#d3af37",
  visitedHover: "#000000",
  hover: "#7f7265",
  border: "#000000"
};
const WORLD_POLYGONS_URL = "https://cdn.jsdelivr.net/npm/@rembish/iso-topojson/iso-a2.json";
const WORLD_MARKERS_URL = "https://cdn.jsdelivr.net/npm/@rembish/iso-topojson/iso-a2-markers.json";
const BRAZIL_URL = "https://cdn.jsdelivr.net/gh/henriquemalvar/br-geojson@main/dist/estados.geojson";
const CUSTOM_ISLAND_MARKERS = [
  {
    type: "Feature",
    id: "CL",
    properties: { iso_a2: "CL", display_name: "Ilha de Páscoa (Chile)" },
    geometry: { type: "Point", coordinates: [-109.3497, -27.1127] }
  }
];

const countryNames = {
  AD:"Andorra", AE:"Emirados Árabes Unidos", AF:"Afeganistão", AG:"Antígua e Barbuda", AL:"Albânia", AM:"Armênia", AO:"Angola", AR:"Argentina", AT:"Áustria", AU:"Austrália", AZ:"Azerbaijão", BA:"Bósnia e Herzegovina", BB:"Barbados", BD:"Bangladesh", BE:"Bélgica", BF:"Burkina Faso", BG:"Bulgária", BH:"Bahrein", BI:"Burundi", BJ:"Benim", BN:"Brunei", BO:"Bolívia", BR:"Brasil", BS:"Bahamas", BT:"Butão", BW:"Botsuana", BY:"Bielorrússia", BZ:"Belize", CA:"Canadá", CD:"República Democrática do Congo", CF:"República Centro-Africana", CG:"República do Congo", CH:"Suíça", CI:"Costa do Marfim", CL:"Chile", CM:"Camarões", CN:"China", CO:"Colômbia", CR:"Costa Rica", CU:"Cuba", CV:"Cabo Verde", CY:"Chipre", CZ:"Tchéquia", DE:"Alemanha", DJ:"Djibuti", DK:"Dinamarca", DM:"Dominica", DO:"República Dominicana", DZ:"Argélia", EC:"Equador", EE:"Estônia", EG:"Egito", ER:"Eritreia", ES:"Espanha", ET:"Etiópia", FI:"Finlândia", FJ:"Fiji", FM:"Micronésia", FR:"França", GA:"Gabão", GB:"Reino Unido", GD:"Granada", GE:"Geórgia", GH:"Gana", GM:"Gâmbia", GN:"Guiné", GQ:"Guiné Equatorial", GR:"Grécia", GT:"Guatemala", GW:"Guiné-Bissau", GY:"Guiana", HN:"Honduras", HR:"Croácia", HT:"Haiti", HU:"Hungria", ID:"Indonésia", IE:"Irlanda", IL:"Israel", IN:"Índia", IQ:"Iraque", IR:"Irã", IS:"Islândia", IT:"Itália", JM:"Jamaica", JO:"Jordânia", JP:"Japão", KE:"Quênia", KG:"Quirguistão", KH:"Camboja", KI:"Kiribati", KM:"Comores", KN:"São Cristóvão e Névis", KP:"Coreia do Norte", KR:"Coreia do Sul", KW:"Kuwait", KZ:"Cazaquistão", LA:"Laos", LB:"Líbano", LC:"Santa Lúcia", LI:"Liechtenstein", LK:"Sri Lanka", LR:"Libéria", LS:"Lesoto", LT:"Lituânia", LU:"Luxemburgo", LV:"Letônia", LY:"Líbia", MA:"Marrocos", MC:"Mônaco", MD:"Moldávia", ME:"Montenegro", MG:"Madagascar", MH:"Ilhas Marshall", MK:"Macedônia do Norte", ML:"Mali", MM:"Myanmar", MN:"Mongólia", MR:"Mauritânia", MT:"Malta", MU:"Maurício", MV:"Maldivas", MW:"Malawi", MX:"México", MY:"Malásia", MZ:"Moçambique", NA:"Namíbia", NE:"Níger", NG:"Nigéria", NI:"Nicarágua", NL:"Países Baixos", NO:"Noruega", NP:"Nepal", NR:"Nauru", NZ:"Nova Zelândia", OM:"Omã", PA:"Panamá", PE:"Peru", PG:"Papua-Nova Guiné", PH:"Filipinas", PK:"Paquistão", PL:"Polônia", PS:"Palestina", PT:"Portugal", PW:"Palau", PY:"Paraguai", QA:"Catar", RO:"Romênia", RS:"Sérvia", RU:"Rússia", RW:"Ruanda", SA:"Arábia Saudita", SB:"Ilhas Salomão", SC:"Seicheles", SD:"Sudão", SE:"Suécia", SG:"Singapura", SI:"Eslovênia", SK:"Eslováquia", SL:"Serra Leoa", SM:"San Marino", SN:"Senegal", SO:"Somália", SR:"Suriname", SS:"Sudão do Sul", ST:"São Tomé e Príncipe", SV:"El Salvador", SY:"Síria", SZ:"Essuatíni", TD:"Chade", TG:"Togo", TH:"Tailândia", TJ:"Tajiquistão", TL:"Timor-Leste", TM:"Turcomenistão", TN:"Tunísia", TO:"Tonga", TR:"Turquia", TT:"Trinidad e Tobago", TV:"Tuvalu", TW:"Taiwan", TZ:"Tanzânia", UA:"Ucrânia", UG:"Uganda", US:"Estados Unidos", UY:"Uruguai", UZ:"Uzbequistão", VA:"Vaticano", VC:"São Vicente e Granadinas", VE:"Venezuela", VN:"Vietnã", VU:"Vanuatu", WS:"Samoa", XK:"Kosovo", YE:"Iêmen", ZA:"África do Sul", ZM:"Zâmbia", ZW:"Zimbábue"
};

function updateStats() {
  const total = Object.keys(config.countries).length;
  const count = visitedCountries.size;
  const percent = total ? (count / total) * 100 : 0;
  document.querySelector("#visited-count").textContent = count;
  document.querySelector("#world-percent").textContent = `${percent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do mundo explorado`;
  document.querySelector("#progress-bar").style.width = `${Math.min(percent, 100)}%`;
}

const featureCode = feature => feature.properties?.iso_a2 || feature.id || "";
const featureName = feature => feature.properties?.display_name || countryNames[featureCode(feature)] || feature.properties?.name || featureCode(feature);
const countryColor = feature => visitedCountries.has(featureCode(feature)) ? COLORS.visited : COLORS.land;
const stateColor = feature => {
  const code = feature.properties?.sigla || feature.id || "";
  const entireBrazil = config.countries.BR === true && visitedStates.size === 0;
  return visitedStates.has(code) || entireBrazil ? COLORS.visited : COLORS.land;
};

function normalizeRings(feature) {
  const normalized = structuredClone(feature);
  const geometry = normalized.geometry;
  if (geometry?.type === "Polygon") {
    geometry.coordinates.forEach(ring => ring.reverse());
  } else if (geometry?.type === "MultiPolygon") {
    geometry.coordinates.forEach(polygon => polygon.forEach(ring => ring.reverse()));
  }
  return normalized;
}

function bindTooltip(selection, tooltip, nameGetter, colorGetter) {
  selection
    .on("mouseenter", function(event, feature) {
      d3.select(this).attr("fill", colorGetter(feature) === COLORS.visited ? COLORS.visitedHover : COLORS.hover);
      tooltip.text(nameGetter(feature)).classed("show", true);
    })
    .on("mousemove", event => positionTooltip(tooltip, event))
    .on("mouseleave", function(event, feature) {
      d3.select(this).attr("fill", colorGetter(feature));
      tooltip.classed("show", false);
    });
}

function positionTooltip(tooltip, event) {
  const node = tooltip.node();
  const gap = 14;
  const edge = 8;
  const width = node.offsetWidth;
  const height = node.offsetHeight;
  let left = event.clientX + gap;
  let top = event.clientY + gap;

  if (left + width > window.innerWidth - edge) left = event.clientX - width - gap;
  if (top + height > window.innerHeight - edge) top = event.clientY - height - gap;

  tooltip
    .style("left", `${Math.max(edge, left)}px`)
    .style("top", `${Math.max(edge, top)}px`);
}

function topologyFeatures(topology) {
  return Object.values(topology.objects).flatMap(object => {
    const converted = topojson.feature(topology, object);
    return converted.type === "FeatureCollection" ? converted.features : [converted];
  });
}

function renderMap(worldTopology, markerTopology, brazilGeoJSON) {
  const container = document.querySelector("#world-map");
  const width = container.clientWidth;
  const height = container.clientHeight;
  container.replaceChildren();
  d3.selectAll(".map-tooltip").remove();

  const allFeatures = topologyFeatures(worldTopology);
  // O pacote também contém objetos auxiliares; apenas regiões com ISO entram no mapa.
  const mappedFeatures = allFeatures.filter(feature => /^[A-Z]{2}$/.test(featureCode(feature)) && featureCode(feature) !== "AQ");
  const countries = mappedFeatures.filter(feature => feature.geometry && feature.geometry.type !== "Point");
  const markers = topologyFeatures(markerTopology)
    .filter(feature => feature.geometry?.type === "Point" && /^[A-Z]{2}$/.test(featureCode(feature)))
    .concat(CUSTOM_ISLAND_MARKERS);
  const states = brazilGeoJSON.features.map(normalizeRings);
  const collection = { type: "FeatureCollection", features: countries };
  const projection = d3.geoNaturalEarth1().fitExtent([[10, 8], [width - 10, height - 8]], collection);
  const path = d3.geoPath(projection);

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img").attr("aria-label", "Mapa-múndi com países visitados e estados brasileiros");
  const viewport = svg.append("g");
  const tooltip = d3.select(document.body).append("div").attr("class", "map-tooltip");

  const countryPaths = viewport.append("g").selectAll("path").data(countries).join("path")
    .attr("d", path).attr("fill", countryColor).attr("stroke", COLORS.border).attr("stroke-width", 0.7).attr("vector-effect", "non-scaling-stroke");
  bindTooltip(countryPaths, tooltip, featureName, countryColor);

  const statePaths = viewport.append("g").attr("class", "brazil-states").selectAll("path").data(states).join("path")
    .attr("d", path).attr("fill", stateColor).attr("stroke", COLORS.border).attr("stroke-width", 0.75).attr("vector-effect", "non-scaling-stroke");
  bindTooltip(statePaths, tooltip, feature => feature.properties?.nome || feature.properties?.sigla, stateColor);

  const markerLayer = viewport.append("g").attr("class", "microstates");
  const markerGroups = markerLayer.selectAll("g").data(markers).join("g")
    .attr("transform", feature => {
      const point = projection(feature.geometry.coordinates);
      return point ? `translate(${point[0]},${point[1]})` : null;
    });
  markerGroups.append("circle").attr("class", "marker-hit").attr("r", 11);
  markerGroups.append("circle").attr("class", "marker-dot").attr("r", 3.5).attr("fill", countryColor)
    .attr("stroke", COLORS.border).attr("stroke-width", 1.3).attr("vector-effect", "non-scaling-stroke");
  markerGroups
    .on("mouseenter", function(event, feature) {
      const color = countryColor(feature) === COLORS.visited ? COLORS.visitedHover : COLORS.hover;
      d3.select(this).select(".marker-dot").attr("r", 5).attr("fill", color);
      tooltip.text(featureName(feature)).classed("show", true);
    })
    .on("mousemove", event => positionTooltip(tooltip, event))
    .on("mouseleave", function(event, feature) {
      d3.select(this).select(".marker-dot").attr("r", 3.5).attr("fill", countryColor(feature));
      tooltip.classed("show", false);
    });

  const zoom = d3.zoom().scaleExtent([1, 14]).translateExtent([[0, 0], [width, height]]).extent([[0, 0], [width, height]])
    .on("zoom", event => {
      viewport.attr("transform", event.transform);
      markerLayer.style("display", event.transform.k >= 2.5 ? "none" : null);
      if (event.transform.k >= 2.5) tooltip.classed("show", false);
    });
  svg.call(zoom).on("dblclick.zoom", null);
}

async function initializeMap() {
  if (typeof d3 === "undefined" || typeof topojson === "undefined") {
    console.error("D3 ou TopoJSON não foi carregado.");
    return;
  }
  try {
    const [world, markers, brazil] = await Promise.all([
      fetch(WORLD_POLYGONS_URL).then(response => { if (!response.ok) throw new Error("Falha ao carregar países"); return response.json(); }),
      fetch(WORLD_MARKERS_URL).then(response => { if (!response.ok) throw new Error("Falha ao carregar marcadores"); return response.json(); }),
      fetch(BRAZIL_URL).then(response => { if (!response.ok) throw new Error("Falha ao carregar estados"); return response.json(); })
    ]);
    let resizeTimer;
    const draw = () => renderMap(world, markers, brazil);
    draw();
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(draw, 120);
    });
  } catch (error) {
    console.error(error);
  }
}

updateStats();
initializeMap();
