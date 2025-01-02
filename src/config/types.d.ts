export type Group = keyof typeof import('./config.js').groups

export interface ThrottleConfiguration {
    durationMs: number,
    /**
     * Groups (in addition to admin and superUser) that are exempt from
     *  throttling
     */
    exemptGroups?: Array<Group>
}
