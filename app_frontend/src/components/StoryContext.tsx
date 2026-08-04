import { createContext, useContext, useState } from 'react';

type StoryContextType = {
    paused: boolean;
    setPaused: React.Dispatch<React.SetStateAction<boolean>>;
};

const StoryContext = createContext<StoryContextType | null>(null);

export const StoryProvider = ({ children }: { children: React.ReactNode }) => {
    const [paused, setPaused] = useState(false);

    return (
        <StoryContext.Provider
            value={{
                paused,
                setPaused,
            }}
        >
            {children}
        </StoryContext.Provider>
    );
};

export const useStory = () => {
    const context = useContext(StoryContext);

    if (!context) {
        throw new Error('useStory must be used inside StoryProvider');
    }

    return context;
};
