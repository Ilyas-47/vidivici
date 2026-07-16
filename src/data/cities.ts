export const moroccanCities = [
  { name: 'Casablanca', shippingCost: 20 },
  { name: 'Rabat', shippingCost: 25 },
  { name: 'Salé', shippingCost: 25 },
  { name: 'Temara', shippingCost: 25 },
  { name: 'Mohammedia', shippingCost: 25 },
  { name: 'Kénitra', shippingCost: 30 },
  { name: 'Marrakech', shippingCost: 35 },
  { name: 'Tanger', shippingCost: 35 },
  { name: 'Fès', shippingCost: 35 },
  { name: 'Meknès', shippingCost: 35 },
  { name: 'Agadir', shippingCost: 40 },
  { name: 'Oujda', shippingCost: 40 },
  { name: 'Tétouan', shippingCost: 35 },
  { name: 'Safi', shippingCost: 40 },
  { name: 'El Jadida', shippingCost: 35 },
  { name: 'Beni Mellal', shippingCost: 40 },
  { name: 'Nador', shippingCost: 40 },
  { name: 'Khouribga', shippingCost: 40 },
  { name: 'Settat', shippingCost: 35 },
  { name: 'Laayoune', shippingCost: 50 },
  { name: 'Dakhla', shippingCost: 50 },
  { name: 'Autre ville', shippingCost: 45 },
].sort((a, b) => {
  if (a.name === 'Autre ville') return 1;
  if (b.name === 'Autre ville') return -1;
  return a.name.localeCompare(b.name);
});
