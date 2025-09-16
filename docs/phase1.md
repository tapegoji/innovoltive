# Phase 1: Database Schema Updates and Basic Quota Enforcement

## Overview
Phase 1 focuses on establishing the foundational database structure and basic enforcement mechanisms for user storage quotas and project storage paths. This phase builds directly on your existing Next.js + PostgreSQL + Clerk setup, ensuring minimal disruption while laying the groundwork for simulation capabilities.

## Objectives
- Implement per-user storage quotas (default 1GB)
- Generate unique storage paths for each project
- Prepare database for simulation job tracking
- Maintain backward compatibility with existing projects

## Detailed Implementation Steps

### 1. Database Schema Design
**Status:** In Progress

#### New Tables:
- `user_quotas`: Track total/used storage per user
- `project_storage_paths`: Map projects to filesystem/cloud paths

#### Updated Tables:
- Add `storage_path_id` foreign key to `projects`
- Add `quota_id` foreign key to `user_projects` or create junction table

#### Constraints:
- Ensure quota limits are enforced at database level where possible

### 2. Database Migration Scripts
**Status:** Pending

- Create SQL migration files for schema changes
- Include data migration for existing projects (assign default storage paths)
- Add seed data for default user quotas
- Implement rollback scripts for safety

### 3. TypeScript Type Definitions
**Status:** Pending

- Update `definitions.ts` with new interfaces:
  - `UserQuota`, `ProjectStoragePath`, `SimulationJob`
- Create Zod schemas for validation
- Ensure type safety across frontend/backend

### 4. Quota Enforcement Logic
**Status:** Pending

- Server actions for:
  - Checking available quota before operations
  - Calculating used storage from project sizes
  - Enforcing limits on project creation/file uploads
- Error handling for quota exceeded scenarios

### 5. Storage Path Generation
**Status:** Pending

- Utility functions to generate paths like `/storage/{user_id}/{project_id}/`
- Ensure path uniqueness and security (no path traversal)
- Support for both local filesystem and future cloud storage

### 6. Update Project CRUD Operations
**Status:** Pending

- Modify `createProject`, `editProject`, `copyProject` actions
- Integrate quota checks and storage path assignment
- Update size tracking when files are added to projects

### 7. Storage Utilities
**Status:** Pending

- Functions for:
  - Path validation and sanitization
  - Storage usage calculation
  - Quota percentage calculations for UI display

### 8. Testing and Validation
**Status:** Pending

- Unit tests for quota logic and path generation
- Integration tests with sample projects
- Verify backward compatibility with existing data

## Technical Requirements
- **Database**: PostgreSQL (already in use)
- **Backend**: Node.js/Next.js server actions
- **Storage**: Local filesystem initially, designed for cloud migration
- **Dependencies**: May need additional packages for file operations (fs-extra, path utilities)

## Success Criteria
- All existing projects retain functionality
- New projects get assigned storage paths and respect user quotas
- Database queries perform efficiently (<100ms for quota checks)
- Clear error messages for quota violations
- Type-safe implementation with full Zod validation

## Risk Mitigation
- Database backups before migrations
- Gradual rollout with feature flags
- Comprehensive logging for debugging
- Rollback procedures documented

## Estimated Timeline
- Schema design: 1-2 days
- Implementation: 3-5 days
- Testing: 1-2 days
- **Total: 1 week**

## Dependencies
- Completion of current database schema assessment
- Access to database for migrations
- No breaking changes to existing user workflows

## Next Steps
This phase establishes the core infrastructure without touching simulation logic yet. Once complete, we'll have a solid foundation for Phase 2's simulation engine.

## Related Files
- `/src/lib/definitions.ts` - Type definitions
- `/src/lib/data.ts` - Database operations
- `/src/lib/actions.ts` - Server actions
- Database migration files (to be created)

## Notes
- All changes should maintain backward compatibility
- Consider implementing feature flags for gradual rollout
- Document all database changes for future reference