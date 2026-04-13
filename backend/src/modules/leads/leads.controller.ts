import { NextFunction, Request, Response } from "express";
import {
  assignLead,
  createLead,
  createLeadActivity,
  deleteLead,
  getLeadDetail,
  listLeads,
  updateLead,
  updateLeadStatus,
} from "./leads.service.js";
import {
  validateAssignLeadInput,
  validateCreateLeadActivityInput,
  validateCreateLeadInput,
  validateUpdateLeadInput,
  validateUpdateLeadStatusInput,
} from "./leads.validators.js";
import { parsePagination } from "../../utils/pagination.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string | null;
    userType: "customer" | "staff";
    roles?: string[];
  };
};

function getParamAsString(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }

  throw new Error("Missing route parameter");
}

function getQueryAsString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }

  return undefined;
}

function getActor(req: AuthenticatedRequest) {
  if (!req.user?.userId) {
    return null;
  }

  return {
    userId: req.user.userId,
    email: req.user.email,
    userType: req.user.userType,
    roles: req.user.roles || [],
  };
}

export async function createPublicLeadHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateCreateLeadInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const data = await createLead(req.body, null);

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createLeadHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateCreateLeadInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const actor = getActor(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await createLead(req.body, {
      userId: actor.userId,
      roles: actor.roles,
    });

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listLeadsHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const actor = getActor(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { page, pageSize } = parsePagination({
      page: req.query.page,
      pageSize: req.query.pageSize,
    });

    const status = getQueryAsString(req.query.status);
    const source = getQueryAsString(req.query.source);
    const keyword = getQueryAsString(req.query.keyword);
    const assignedToUserId = getQueryAsString(req.query.assignedToUserId);

    const data = await listLeads(
      {
        status: status as
          | "new"
          | "contacted"
          | "qualified"
          | "unqualified"
          | "converted"
          | "lost"
          | undefined,
        source,
        keyword,
        assignedToUserId,
        page,
        pageSize,
      },
      {
        userId: actor.userId,
        roles: actor.roles,
      }
    );

    return res.json({
      success: true,
      message: "Leads fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getLeadDetailHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const actor = getActor(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const leadId = getParamAsString(req.params.id);
    const data = await getLeadDetail(leadId, {
      userId: actor.userId,
      roles: actor.roles,
    });

    return res.json({
      success: true,
      message: "Lead detail fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateLeadStatusHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateUpdateLeadStatusInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const actor = getActor(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const leadId = getParamAsString(req.params.id);
    const data = await updateLeadStatus(leadId, req.body, {
      userId: actor.userId,
      roles: actor.roles,
    });

    return res.json({
      success: true,
      message: "Lead status updated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function assignLeadHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateAssignLeadInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const actor = getActor(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const leadId = getParamAsString(req.params.id);
    const data = await assignLead(leadId, req.body, actor.userId);

    return res.json({
      success: true,
      message: "Lead assigned successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createLeadActivityHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateCreateLeadActivityInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const actor = getActor(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const leadId = getParamAsString(req.params.id);
    const data = await createLeadActivity(leadId, req.body, {
      userId: actor.userId,
      roles: actor.roles,
    });

    return res.status(201).json({
      success: true,
      message: "Lead activity created successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateLeadHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateUpdateLeadInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const actor = getActor(req);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const leadId = getParamAsString(req.params.id);
    const data = await updateLead(leadId, req.body, {
      userId: actor.userId,
      roles: actor.roles,
    });

    return res.json({
      success: true,
      message: "Lead updated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteLeadHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const leadId = getParamAsString(req.params.id);
    const data = await deleteLead(leadId);

    return res.json({
      success: true,
      message: "Lead deleted successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}