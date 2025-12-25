"use server"

import { createClient } from "@/lib/supabase/server"
import { calculateTotal } from "@/lib/pricing/calculator"
import type { DesignFeature } from "@/stores/design-store"

export interface ProjectData {
  id?: string
  name: string
  address: string
  lat: number
  lng: number
  designData: {
    type: "FeatureCollection"
    features: DesignFeature[]
  }
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  notes?: string
  status?: "draft" | "quoted" | "approved" | "completed"
}

export interface Project {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  design_data: {
    type: "FeatureCollection"
    features: DesignFeature[]
  }
  total_lf: number
  parallel_lf: number
  transition_count: number
  stormwater_count: number
  total_cost: number
  status: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ProjectListItem {
  id: string
  name: string
  address: string
  total_cost: number
  status: string
  updated_at: string
}

export async function saveProject(data: ProjectData) {
  const supabase = await createClient()

  const pricing = calculateTotal(data.designData.features)

  const projectData = {
    name: data.name,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    design_data: data.designData,
    total_lf: pricing.hydrobloxLF,
    parallel_lf: pricing.parallelLF,
    transition_count: pricing.transitionCount,
    stormwater_count: pricing.stormwaterCount,
    total_cost: pricing.total,
    customer_name: data.customerName || null,
    customer_phone: data.customerPhone || null,
    customer_email: data.customerEmail || null,
    notes: data.notes || null,
    status: data.status || "draft",
    updated_at: new Date().toISOString(),
  }

  if (data.id) {
    // Update existing project
    const { data: project, error } = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", data.id)
      .select()
      .single()

    if (error) {
      return { project: null, error: error.message }
    }

    return { project: project as Project, error: null }
  } else {
    // Create new project
    const { data: project, error } = await supabase
      .from("projects")
      .insert(projectData)
      .select()
      .single()

    if (error) {
      return { project: null, error: error.message }
    }

    return { project: project as Project, error: null }
  }
}

export async function getProject(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return { project: null, error: error.message }
  }

  return { project: data as Project, error: null }
}

export async function listProjects() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, address, total_cost, status, updated_at")
    .order("updated_at", { ascending: false })

  if (error) {
    return { projects: null, error: error.message }
  }

  return { projects: data as ProjectListItem[], error: null }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export async function updateProjectStatus(
  id: string,
  status: "draft" | "quoted" | "approved" | "completed"
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { project: null, error: error.message }
  }

  return { project: data as Project, error: null }
}
