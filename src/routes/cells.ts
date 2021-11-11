/** @format */

import express from 'express';
import fs from 'fs/promises';
import path from 'path';

interface Cell {
  id: string;
  content: string;
  type: 'text' | 'code';
}

export const createCellsRouter = (filename: string, dir: string) => {
  const router = express.Router();
  router.use(express.json());

  const fullPath = path.join(dir, filename);

  router.get('/cells', async (req, res) => {
    try {
      //Read the file
      const result = await fs.readFile(fullPath, { encoding: 'utf8' });
      res.send(JSON.parse(result));
    } catch (err: any) {
      //if read throw an error
      //inspect it and see if it says that it does not exist
      if (err.code === 'ENOENT') {
        //add in code to create a file and add default cells
        await fs.writeFile(fullPath, '[]', 'utf-8');
        res.send([]);
      } else {
        throw err;
      }
    }
  });

  router.post('/cells', async (req, res) => {
    //Take the list of cells from the request object
    //serialize the list of cells
    const { cells }: { cells: Cell[] } = req.body;
    //write the cells into the file
    await fs.writeFile(fullPath, JSON.stringify(cells), 'utf-8');
    //send result status
    res.send({ status: 'ok' });
  });
  return router;
};
