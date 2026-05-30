export const PHILIPPINE_CITIES: string[] = [
  // NCR
  'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila',
  'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig',
  'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela',

  // CAR
  'Baguio', 'Bangued', 'Bontoc', 'Lagawe', 'La Trinidad', 'Tabuk', 'Tingayan',

  // Region I
  'Alaminos', 'Batac', 'Candon', 'Dagupan', 'Laoag', 'San Fernando (La Union)',
  'San Carlos (Pangasinan)', 'Tarlac City', 'Urdaneta', 'Vigan',

  // Region II
  'Bayombong', 'Cauayan', 'Ilagan', 'Santiago', 'Tuguegarao',

  // Region III
  'Angeles', 'Balanga', 'Cabanatuan', 'Gapan', 'Malolos', 'Meycauayan',
  'Muñoz', 'Olongapo', 'Palayan', 'San Fernando (Pampanga)',
  'San Jose del Monte', 'Tarlac City',

  // Region IV-A (CALABARZON)
  'Antipolo', 'Batangas City', 'Biñan', 'Cabuyao', 'Calamba',
  'Cainta', 'Lipa', 'Lucena', 'San Pablo', 'Santa Rosa', 'Tagaytay', 'Taytay',

  // Region IV-B (MIMAROPA)
  'Calapan', 'Mamburao', 'Puerto Princesa', 'Romblon', 'San Jose (Occidental Mindoro)',

  // Region V
  'Iriga', 'Legazpi', 'Ligao', 'Naga', 'Sorsogon City', 'Tabaco',

  // Region VI
  'Bacolod', 'Bago', 'Cadiz', 'Escalante', 'Himamaylan', 'Iloilo City',
  'Kabankalan', 'La Carlota', 'Passi', 'Roxas City', 'Sagay',
  'San Carlos (Negros Occidental)', 'Silay', 'Sipalay', 'Talisay (Negros Occidental)',
  'Victorias',

  // Region VII
  'Bais', 'Bayawan', 'Bogo', 'Canlaon', 'Carcar', 'Cebu City', 'Danao',
  'Dumaguete', 'Guihulngan', 'Lapu-Lapu', 'Mandaue', 'Naga (Cebu)',
  'Tagbilaran', 'Talisay (Cebu)', 'Toledo',

  // Region VIII
  'Baybay', 'Borongan', 'Calbayog', 'Catbalogan', 'Maasin', 'Ormoc', 'Tacloban',

  // Region IX
  'Dapitan', 'Dipolog', 'Isabela City', 'Pagadian', 'Zamboanga City',

  // Region X
  'Cagayan de Oro', 'El Salvador', 'Gingoog', 'Iligan', 'Malaybalay',
  'Oroquieta', 'Ozamiz', 'Tangub', 'Valencia',

  // Region XI
  'Davao City', 'Digos', 'Island Garden City of Samal', 'Mati', 'Panabo', 'Tagum',

  // Region XII
  'Cotabato City', 'General Santos', 'Kidapawan', 'Koronadal', 'Tacurong',

  // Region XIII (Caraga)
  'Bayugan', 'Bislig', 'Butuan', 'Cabadbaran', 'Surigao City', 'Tandag',

  // BARMM
  'Cotabato City', 'Lamitan', 'Marawi',
].filter((v, i, a) => a.indexOf(v) === i).sort();
