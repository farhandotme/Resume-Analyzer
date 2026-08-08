import { createContext, useContext, useState } from 'react';

type StoryContextType = {
    paused: boolean;
    setPaused: React.Dispatch<React.SetStateAction<boolean>>;
    analysisResult: any;
    setAnalysisResult: React.Dispatch<React.SetStateAction<any>>;
};

const StoryContext = createContext<StoryContextType | null>(null);

export const StoryProvider = ({ children, initialAnalysisResult }: { children: React.ReactNode; initialAnalysisResult: any }) => {
    const [paused, setPaused] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(initialAnalysisResult);

    return (
        <StoryContext.Provider
            value={{
                paused,
                setPaused,
                analysisResult,
                setAnalysisResult,
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
