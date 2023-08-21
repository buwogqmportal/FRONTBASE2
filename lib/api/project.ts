import type { ConnectionSend } from '$baselib/connection';

enum APIProjectStatus {
  Private = '1',
  Public = '2',
  Archived = '3',
}

export type APIProject = {
  project_ID: string;
  project_status: APIProjectStatus;
  project_createuser_ID: string;
  project_create_timestamp: string;
  project_data: {
    project_title: string;
    project_description: string;
    project_description_long: string;
    project_location: string;
    project_street: string;
    project_zipcode: string;
    project_city: string;
    project_state: string;
    project_country: string;
    project_external_ID: string;
  };
};

export type APIProjectPost = { project_title: string; project_image: string };

// export async function setProject(data: ProjectPost, connectionSend: ConnectionSend): Promise<Project> {
//   const json = await connectionSend<string>('project/set', data);

//   return {
//     project_ID: json.success.data,
//     project_data: {
//       ...data,
//       project_status: ProjectStatus.Private,
//     },
//   };
// }

// export async function updateProject(
//   project_ID: string,
//   data: ProjectPost,
//   connectionSend: ConnectionSend,
// ): Promise<Project> {
//   await connectionSend('project/update', { project_ID, ...data });

//   return {
//     project_ID,
//     project_data: {
//       ...data,
//       project_status: ProjectStatus.Private,
//     },
//   };
// }

export async function deleteProject(project_ID: string, connectionSend: ConnectionSend): Promise<void> {
  await connectionSend('project/delete', { project_ID });
}
