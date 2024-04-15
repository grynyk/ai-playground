import { isNil } from 'lodash';
import puppeteer from 'puppeteer';

export const getPageContent = async (url: string, tagName: string): Promise<string | null> => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url);
    if (isNil(page)) {
        return null;
    }
    const targetElement = await page.$(tagName);
    if (isNil(targetElement)) {
        return null;
    }
    const textContent = await targetElement.getProperty('textContent')
    const result = await textContent.jsonValue();
    browser.close();
    return result;
  } catch (error) {
    browser.close();
    throw(error);
  }
};