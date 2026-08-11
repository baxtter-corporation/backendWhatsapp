import { Router, Request, Response, RequestHandler } from 'express';
import { prismaRepository } from '@api/server.module';

function lowerFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export class DbRouter {
  public readonly router: Router = Router();

  constructor(...guards: RequestHandler[]) {
    // GET /db/:table -> returns all rows from the prisma model
    this.router.get('/:table', ...guards, async (req: Request, res: Response) => {
      try {
        const table = req.params.table as string;
        const model = lowerFirst(table);

        const repo: any = (prismaRepository as any)[model];
        if (!repo || typeof repo.findMany !== 'function') {
          return res.status(404).json({ error: `Model "${model}" not found` });
        }

        const items = await repo.findMany();
        return res.status(200).json(items || []);
      } catch (error) {
        return res.status(500).json({ error: error?.toString() });
      }
    });

    // POST /db/:table -> create a row on the prisma model
    this.router.post('/:table', ...guards, async (req: Request, res: Response) => {
      try {
        const table = req.params.table as string;
        const model = lowerFirst(table);

        const repo: any = (prismaRepository as any)[model];
        if (!repo || typeof repo.create !== 'function') {
          return res.status(404).json({ error: `Model "${model}" not found` });
        }

        const created = await repo.create({ data: req.body });
        return res.status(201).json(created);
      } catch (error) {
        return res.status(500).json({ error: error?.toString() });
      }
    });
  }
}
