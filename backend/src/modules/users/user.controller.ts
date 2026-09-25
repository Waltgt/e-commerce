import { Response } from "express";
import { listUsers, getUserDetail, adminBlockUser, adminUnblockUser } from "./user.service";
import { ok } from "../../lib/apiResponse";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export async function getUsersHandler(req: AuthenticatedRequest, res: Response) {
  const users = await listUsers();
  res.json(ok(users));
}

export async function getUserDetailHandler(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const user = await getUserDetail(id);
  res.json(ok(user));
}

export async function blockUserHandler(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  await adminBlockUser(id, req.user!.userId);
  res.json(ok({ message: "Usuario bloqueado" }));
}

export async function unblockUserHandler(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  await adminUnblockUser(id);
  res.json(ok({ message: "Usuario desbloqueado" }));
}