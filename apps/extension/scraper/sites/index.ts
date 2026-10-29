import { type Site } from '../types';
import { amazon } from './amazon';

const sites: Site[] = [amazon];

export const findSite = (pageUrl: URL) =>
  sites.find((site) => site.match(pageUrl));
