// Natural Earth 50m
export const DATA_URL = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson';

export const NAME_VARIANTS = [
    'ADMIN',
    'NAME',
    'NAME_LONG',
    'NAME_EN',
    'FORMAL_EN',
    'NAME_SORT',
] as const;

// Aliases -> canonical name as it appears in the Natural Earth ADMIN field
export const ALIASES: Record<string, string>  = {
    'united states': 'United States of America',
    'britain': 'United Kingdom',
    'uae': 'United Arab Emirates',
    'czechia': 'Czech Republic',
    'dr congo': 'Democratic Republic of the Congo',
    'drc': 'Democratic Republic of the Congo',
    "cote d'ivoire": "Ivory Coast",
    'east timor': 'Timor-Leste',
    'timor leste': 'Timor-Leste',
    'trinidad': 'Trinidad and Tobago',
    'burma': 'Myanmar',
    'swaziland': 'eSwatini',
    'holland': 'Netherlands',
    'macedonia': 'North Macedonia',
    'sao tome and principe': 'São Tomé and Príncipe',
    'st lucia': 'Saint Lucia',
    'st vincent': 'Saint Vincent and the Grenadines',
    'vatican city': 'Vatican',
};

// -- Projection constants ---------------------------------------------------

export const ASPECT = 2.0; // width / height ratio for the canvas
