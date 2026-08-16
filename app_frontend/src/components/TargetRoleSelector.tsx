import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { POPULAR_ROLES, ROLE_SUGGESTIONS, type RoleSuggestion } from '../data/roleSuggestions.ts';

interface TargetRoleSelectorProps {
    value: string;
    onChange: (value: string) => void;
    onSelectionChange: (selected: boolean) => void;
    onEnter: (role: string) => void;
    isSelected: boolean;
}

const LISTBOX_ID = 'target-role-listbox';

export default function TargetRoleSelector({ value, onChange, onSelectionChange, onEnter, isSelected }: TargetRoleSelectorProps) {
    const [query, setQuery] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [showAllRoles, setShowAllRoles] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowAllRoles(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const trimmedQuery = query.trim();

    const results = useMemo<RoleSuggestion[]>(() => {
        if (!trimmedQuery) {
            return showAllRoles ? ROLE_SUGGESTIONS : POPULAR_ROLES;
        }

        const q = trimmedQuery.toLowerCase();
        return ROLE_SUGGESTIONS.filter((role) => role.title.toLowerCase().includes(q)).slice(0, showAllRoles ? 100 : 7);
    }, [trimmedQuery, showAllRoles]);

    const totalOptions = results.length;

    const allRoles = useMemo(() => {
        return [...ROLE_SUGGESTIONS].sort((a, b) => a.title.localeCompare(b.title));
    }, []);

    useEffect(() => {
        setHighlightedIndex(0);
    }, [query, isOpen]);

    const commitSelection = (title: string) => {
        onChange(title);
        setQuery(title);
        onSelectionChange(true);
        setIsOpen(false);
        setShowAllRoles(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            if (!isOpen) {
                if (isSelected && value.trim()) {
                    onEnter(value.trim());
                    return;
                }

                setIsOpen(true);
                return;
            }

            if (highlightedIndex < results.length && results[highlightedIndex]) {
                const selectedRole = results[highlightedIndex].title;

                commitSelection(selectedRole);
                onEnter(selectedRole);
            }

            return;
        }

        if (!isOpen) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setIsOpen(true);
            }

            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();

            setHighlightedIndex((prev) => (prev + 1) % Math.max(totalOptions, 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();

            setHighlightedIndex((prev) => (prev - 1 + totalOptions) % Math.max(totalOptions, 1));
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setIsOpen(false);
        }
    };

    const isMenuVisible = isOpen && results.length > 0;

    return (
        <div ref={containerRef} className='relative mt-5 w-full' onClick={(event) => event.stopPropagation()}>
            <label htmlFor='target-role-input' className='mb-2 flex items-center justify-center text-[13px] font-medium text-zinc-700 dark:text-zinc-300'>
                <span>Target role</span>
            </label>
            <div className='relative'>
                <Search className='pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500' strokeWidth={1.8} />

                <input
                    id='target-role-input'
                    type='text'
                    role='combobox'
                    aria-expanded={isOpen}
                    aria-controls={LISTBOX_ID}
                    aria-autocomplete='list'
                    aria-activedescendant={isMenuVisible ? `${LISTBOX_ID}-option-${highlightedIndex}` : undefined}
                    autoComplete='off'
                    value={query}
                    placeholder='e.g. Hotel Manager, Data Analyst, Sales Executive'
                    onChange={(event) => {
                        setQuery(event.target.value);
                        onChange(event.target.value);
                        onSelectionChange(false);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className='h-11 w-full select-text rounded-xl border border-zinc-200 bg-white pl-10 pr-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-100/10'
                />

                <div
                    role='listbox'
                    id={LISTBOX_ID}
                    className={`absolute left-0 right-0 top-full z-20 mt-1 origin-top overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/60 transition-all duration-150 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40 ${
                        isMenuVisible ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-1 opacity-0'
                    }`}
                >
                    {!trimmedQuery && (
                        <div className='flex items-center justify-between px-3.5 pb-1 pt-2.5'>
                            <span className='font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500'>{showAllRoles ? 'All roles' : 'Popular roles'}</span>

                            {!showAllRoles && (
                                <button
                                    type='button'
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                    }}
                                    onClick={() => {
                                        setShowAllRoles(true);
                                        setHighlightedIndex(0);
                                    }}
                                    className='cursor-pointer text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                                >
                                    Browse all roles →
                                </button>
                            )}
                        </div>
                    )}

                    <ul className='role-scrollbar max-h-64 overflow-y-auto py-1'>
                        {showAllRoles && !trimmedQuery ? (
                            allRoles.map((role) => (
                                <li
                                    key={role.title}
                                    role='option'
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        commitSelection(role.title);
                                    }}
                                    className='flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-sm transition-colors duration-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                >
                                    <span className='text-zinc-800 dark:text-zinc-200'>{role.title}</span>

                                    <span className='shrink-0 font-mono text-[10.5px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>{role.category}</span>
                                </li>
                            ))
                        ) : (
                            <>
                                {results.map((role, index) => (
                                    <li
                                        key={role.title}
                                        id={`${LISTBOX_ID}-option-${index}`}
                                        role='option'
                                        aria-selected={highlightedIndex === index}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            commitSelection(role.title);
                                        }}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        className={`flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-sm transition-colors duration-100 ${highlightedIndex === index ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
                                    >
                                        <span className='text-zinc-800 dark:text-zinc-200'>{role.title}</span>

                                        <span className='shrink-0 font-mono text-[10.5px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>{role.category}</span>
                                    </li>
                                ))}
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}