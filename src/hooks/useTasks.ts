import { useState, useEffect, useCallback } from 'react';
import { API_URL, MESSAGES } from '../utils/constants';
import type { Task, TaskFormData, UseTasksReturn } from '../types';

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Função genérica para chamadas da API
  const apiRequest = useCallback(
    async <T>(url: string, options?: RequestInit): Promise<T> => {
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorMessage = 'Erro na requisição';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {}

        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    },
    []
  );

  // Validação reutilizável
  const validateTask = useCallback((taskData: TaskFormData): boolean => {
    if (!taskData.title.trim()) {
      setError(MESSAGES.ERROR_EMPTY_TITLE);
      return false;
    }

    return true;
  }, []);

  // Controle reutilizável de submit
  const executeSubmit = useCallback(
    async (action: () => Promise<void>): Promise<boolean> => {
      setSubmitting(true);
      setError(null);

      try {
        await action();
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : MESSAGES.ERROR_CONNECTION
        );

        console.error(err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const fetchTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest<Task[]>(API_URL);
      setTasks(data);
    } catch (err) {
      setError(MESSAGES.ERROR_LOAD);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  const createTask = useCallback(
    async (taskData: TaskFormData): Promise<boolean> => {
      if (!validateTask(taskData)) return false;

      return executeSubmit(async () => {
        const newTask = await apiRequest<Task>(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...taskData,
            completed: false,
          }),
        });

        // Atualização otimista
        setTasks((prev) => [...prev, newTask]);
      });
    },
    [apiRequest, executeSubmit, validateTask]
  );

  const updateTask = useCallback(
    async (id: number, taskData: TaskFormData): Promise<boolean> => {
      if (!validateTask(taskData)) return false;

      return executeSubmit(async () => {
        const updatedTask = await apiRequest<Task>(
          `${API_URL}/${id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
          }
        );

        // Atualização otimista
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? updatedTask : task
          )
        );
      });
    },
    [apiRequest, executeSubmit, validateTask]
  );

  const toggleTask = useCallback(
    async (id: number): Promise<void> => {
      try {
        const updatedTask = await apiRequest<Task>(
          `${API_URL}/${id}/toggle`,
          {
            method: 'PATCH',
          }
        );

        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? updatedTask : task
          )
        );
      } catch (err) {
        setError(MESSAGES.ERROR_UPDATE);
        console.error(err);
      }
    },
    [apiRequest]
  );

  const deleteTask = useCallback(
    async (id: number): Promise<void> => {
      try {
        await apiRequest(`${API_URL}/${id}`, {
          method: 'DELETE',
        });

        setTasks((prev) =>
          prev.filter((task) => task.id !== id)
        );
      } catch (err) {
        setError(MESSAGES.ERROR_DELETE);
        console.error(err);
      }
    },
    [apiRequest]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    submitting,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    fetchTasks,
  };
}