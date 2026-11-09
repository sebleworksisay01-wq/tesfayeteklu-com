import React, { useEffect } from 'react';
import { SeoPageConfig, GlobalSiteIdentity } from '../types/cms';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  robots?: string;
  pageConfig?: SeoPageConfig;
  identity?: GlobalSiteIdentity;
  breadcrumbs?: BreadcrumbItem[];
  articleData?: {
    headline: string;
    description: string;
    datePublished: string;
    author: string;
    image: string;
    category?: string;
  };
  googleVerification?: string;
  bingVerification?: string;
}

const CANONICAL_ORIGIN = 'https://tesfayeteklu.com';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath = '/',
  keywords,
  ogImage,
  ogType = 'website',
  robots = 'index, follow',
  pageConfig,
  identity,
  breadcrumbs,
  articleData
}) => {
  const activeTitle = pageConfig?.title || title || 'TesfayeTech | Software & Digital Solutions Marketplace';
  const activeDescription = pageConfig?.metaDescription || description || 'Top-tier software development and digital solutions company in Addis Ababa, Ethiopia.';
  const activeKeywords = pageConfig?.keywords || keywords || 'Web Development Company in Ethiopia, Custom Software Development Addis Ababa, Mobile App Development Ethiopia';
  const activeCanonicalUrl = pageConfig?.canonicalUrl || (
    canonicalPath.startsWith('http') ? canonicalPath : `${CANONICAL_ORIGIN}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`
  );
  const activeOgImage = pageConfig?.ogImage || ogImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
  const activeRobots = pageConfig?.robots || robots;
  const activeOgType = pageConfig?.ogType || ogType;

  useEffect(() => {
    // 1. Update Document Title
    document.title = activeTitle;

    // Helper to safely set or update a meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Set Meta Tags
    setMetaTag('name', 'description', activeDescription);
    setMetaTag('name', 'keywords', activeKeywords);
    setMetaTag('name', 'robots', activeRobots);
    setMetaTag('name', 'author', 'TesfayeTech Solutions');

    // 3. OpenGraph Tags
    setMetaTag('property', 'og:title', activeTitle);
    setMetaTag('property', 'og:description', activeDescription);
    setMetaTag('property', 'og:type', activeOgType);
    setMetaTag('property', 'og:url', activeCanonicalUrl);
    setMetaTag('property', 'og:image', activeOgImage);
    setMetaTag('property', 'og:site_name', identity?.companyName || 'TesfayeTech');
    setMetaTag('property', 'og:locale', 'en_US');

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', activeTitle);
    setMetaTag('name', 'twitter:description', activeDescription);
    setMetaTag('name', 'twitter:image', activeOgImage);
    setMetaTag('name', 'twitter:creator', '@tesfayetech');

    // 5. Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', activeCanonicalUrl);

    // 6. JSON-LD Structured Data
    const jsonLdScripts: HTMLScriptElement[] = [];

    // Organization Schema
    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: identity?.companyName || 'TesfayeTech',
      legalName: 'TesfayeTech Solutions PLC',
      url: CANONICAL_ORIGIN,
      logo: `${CANONICAL_ORIGIN}/logo.png`,
      description: identity?.subtagline || 'Engineering high-performance websites, mobile applications, and enterprise automation software in Addis Ababa, Ethiopia.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Addis Ababa',
        addressRegion: 'Addis Ababa',
        postalCode: '1000',
        addressCountry: 'ET'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: identity?.phone || '+251-932083373',
        contactType: 'customer support',
        areaServed: ['ET', 'US', 'GB', 'Global'],
        availableLanguage: ['English', 'Amharic']
      },
      sameAs: [
        identity?.socialLinks?.linkedin || 'https://linkedin.com/company/tesfayetech',
        identity?.socialLinks?.github || 'https://github.com/tesfayetech',
        identity?.socialLinks?.twitter || 'https://twitter.com/tesfayetech',
        identity?.socialLinks?.youtube || 'https://youtube.com/@tesfayetech'
      ]
    };

    // ProfessionalService / LocalBusiness Schema (Addis Ababa Local SEO)
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'TesfayeTech - Software Development & Digital Solutions',
      image: activeOgImage,
      '@id': `${CANONICAL_ORIGIN}/#business`,
      url: CANONICAL_ORIGIN,
      telephone: identity?.phone || '+251-932083373',
      priceRange: '$$',
      currenciesAccepted: 'ETB, USD',
      paymentAccepted: 'Telebirr, Bank Transfer, Wire Transfer',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Addis Ababa',
        addressRegion: 'Addis Ababa',
        postalCode: '1000',
        addressCountry: 'ET'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 9.0300,
        longitude: 38.7400
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:30',
          closes: '17:30'
        }
      ]
    };

    // WebSite Search Schema
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: identity?.companyName || 'TesfayeTech',
      url: CANONICAL_ORIGIN,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${CANONICAL_ORIGIN}/portfolio?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    const injectScript = (id: string, data: object) => {
      let script = document.getElementById(id) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(data);
      jsonLdScripts.push(script);
    };

    injectScript('seo-schema-org', orgSchema);
    injectScript('seo-schema-local', localBusinessSchema);
    injectScript('seo-schema-website', websiteSchema);

    // Breadcrumb Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: crumb.url.startsWith('http') ? crumb.url : `${CANONICAL_ORIGIN}${crumb.url}`
        }))
      };
      injectScript('seo-schema-breadcrumbs', breadcrumbSchema);
    } else {
      const existing = document.getElementById('seo-schema-breadcrumbs');
      if (existing) existing.remove();
    }

    // Article Schema (for Blog articles)
    if (articleData) {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: articleData.headline,
        description: articleData.description,
        image: articleData.image,
        datePublished: articleData.datePublished,
        dateModified: articleData.datePublished,
        author: {
          '@type': 'Person',
          name: articleData.author,
          jobTitle: 'Principal Software Architect',
          worksFor: {
            '@type': 'Organization',
            name: 'TesfayeTech'
          }
        },
        publisher: {
          '@type': 'Organization',
          name: 'TesfayeTech',
          logo: {
            '@type': 'ImageObject',
            url: `${CANONICAL_ORIGIN}/logo.png`
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': activeCanonicalUrl
        }
      };
      injectScript('seo-schema-article', articleSchema);
    } else {
      const existing = document.getElementById('seo-schema-article');
      if (existing) existing.remove();
    }

  }, [
    activeTitle,
    activeDescription,
    activeKeywords,
    activeCanonicalUrl,
    activeOgImage,
    activeRobots,
    activeOgType,
    identity,
    breadcrumbs,
    articleData
  ]);

  return null;
};
