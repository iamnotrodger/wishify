import { type Site } from '../types';
import { amazon } from './amazon';
import { ssense } from './ssense';

const sites: Site[] = [amazon, ssense];

export const findSite = (pageUrl: URL) =>
  sites.find((site) => site.match(pageUrl));
