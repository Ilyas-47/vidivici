import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  name?: string;
  type?: string;
}

export function SEO({
  title = "VIDI VICI | The Premium Moroccan Clothing Brand",
  description = "Découvrez notre collection de vêtements (débardeur, t-shirt et plus) pour les Marocaines. VIDI VICI est une marque spécialisée dans les vêtements de haute qualité.",
  keywords = "debardeur, brand, t shirt, vetements, marocaines, acheter, clothes, mode, fashion, VIDI VICI",
  name = "VIDI VICI",
  type = "website",
}: SEOProps) {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={name} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
