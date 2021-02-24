import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      try {
        const { data } = await api.get<IFoodPlate[]>('foods');

        setFoods(data);
      } catch {
        alert('Não foi possível carregar as informações. Verifique a conexão');
      }
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { data } = await api.post<IFoodPlate>(`foods`, {
        ...food,
        id: Date.now(),
        available: true,
      });

      setFoods(current => [...current, data]);
    } catch (err) {
      console.log(err);
      alert('Não foi possível adicionar o prato. Verifique a conexão');
    }
  }

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const { data } = await api.put<IFoodPlate>(`foods/${editingFood.id}`, {
          food,
        });

        setFoods(current =>
          current.map(item => {
            if (item.id === editingFood.id) {
              return data;
            }

            return item;
          }),
        );
      } catch (error) {
        alert('Não foi possível atualizar o prato');
      }
    },
    [editingFood.id],
  );

  const handleDeleteFood = useCallback(async (id: number): Promise<void> => {
    try {
      await api.delete(`foods/${id}`);

      setFoods(current => current.filter(item => item.id !== id));
    } catch (error) {
      alert('Não foi possível remover o prato');
    }
  }, []);

  const toggleModal = useCallback((): void => {
    setModalOpen(current => !current);
  }, []);

  const toggleEditModal = useCallback((): void => {
    setEditModalOpen(current => !current);
  }, []);

  const handleEditFood = useCallback(
    (food: IFoodPlate): void => {
      setEditingFood(food);
      toggleEditModal();
    },
    [toggleEditModal],
  );

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        editingFood={editingFood}
        setIsOpen={toggleEditModal}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
